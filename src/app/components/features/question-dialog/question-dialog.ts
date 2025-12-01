import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { Question } from '../../../models/question.model';
import { ViewportService } from '../../../services/viewport.service';

@Component({
  selector: 'app-question-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './question-dialog.html',
  styleUrl: './question-dialog.scss',
})
export class QuestionDialog implements OnInit, OnDestroy {
  @Input() question: Question | null = null;

  @Output() autosave = new EventEmitter<Question>();
  @Output() save = new EventEmitter<Question>();
  @Output() cancel = new EventEmitter<void>();

  readonly viewport = inject(ViewportService);
  private readonly fb = inject(FormBuilder);

  private autosaveSub?: Subscription;

  form!: FormGroup<{
    prompt: FormControl<string>;
    answers: FormArray<FormControl<string>>;
  }>;

  ngOnInit(): void {
    const hasValidAnswers = this.question?.answers?.some((a) => a.trim().length > 0) ?? false;

    const initialAnswers = hasValidAnswers ? this.question!.answers : ['', ''];

    this.form = this.fb.nonNullable.group({
      prompt: this.fb.nonNullable.control(this.question?.prompt ?? '', [
        Validators.required,
        Validators.maxLength(200),
      ]),
      answers: this.fb.array<FormControl<string>>(
        initialAnswers.map((ans) => this.fb.nonNullable.control(ans, Validators.required))
      ),
    });

    this.autosaveSub = this.form.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      const q = this.buildQuestionFromForm();
      if (this.hasMinValidState(q)) {
        this.autosave.emit(q);
      }
    });
  }

  ngOnDestroy(): void {
    this.autosaveSub?.unsubscribe();
  }

  get answersArray(): FormArray<FormControl<string>> {
    return this.form.controls.answers;
  }

  cleanedAnswers(): string[] {
    return this.answersArray.controls.map((c) => c.value.trim()).filter((v) => v.length > 0);
  }

  private buildQuestionFromForm(): Question {
    const prompt = this.form.controls.prompt.value.trim();
    const answers = this.cleanedAnswers();

    const base = this.question ?? {};

    return {
      ...(base as Question),
      prompt,
      answers,
    };
  }

  private hasMinValidState(q: Question): boolean {
    return q.prompt.trim().length > 0 && q.answers.length >= 2;
  }

  onAnswerEnter(event: Event, index: number): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.addAnswerOnIndex(index);
  }

  onAnswerBlur(index: number): void {
    this.addAnswerOnIndex(index);
  }

  private addAnswerOnIndex(index: number): void {
    const ctrl = this.answersArray.at(index);
    if (!ctrl) return;

    const value = ctrl.value.trim();
    const isLast = index === this.answersArray.length - 1;
    if (value.length === 0 || !isLast) return;

    this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
  }

  addAnswer(): void {
    const last = this.answersArray.at(this.answersArray.length - 1);
    if (!last || last.value.trim().length === 0) return;

    this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
  }

  removeAnswer(index: number): void {
    this.answersArray.removeAt(index);
    if (this.answersArray.length === 0) {
      this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
    }
  }

  onSave(): void {
    const value = this.buildQuestionFromForm();
    if (!this.hasMinValidState(value)) {
      this.form.controls.prompt.markAsTouched();
      this.answersArray.controls.forEach((c) => c.markAsTouched());
      return;
    }
    this.save.emit(value);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(): void {
    this.cancel.emit();
  }

  isMobile(): boolean {
    return this.viewport.state().isMobile;
  }

  dialogTitle(): string {
    return this.question ? 'Edit question' : 'New question';
  }
}
