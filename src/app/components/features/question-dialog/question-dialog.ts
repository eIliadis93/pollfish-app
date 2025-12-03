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
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AnswerItem } from '../../answer-item/answer-item';

@Component({
  selector: 'app-question-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DragDropModule, AnswerItem],
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
