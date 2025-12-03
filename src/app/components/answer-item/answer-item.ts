import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-answer-item',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './answer-item.html',
  styleUrl: './answer-item.scss',
})
export class AnswerItem {
  @Input({ required: true }) answersArray!: FormArray<FormControl<string>>;

  constructor(private fb: FormBuilder) {}

  addAnswer(): void {
    const lastIndex = this.answersArray.length - 1;
    const lastCtrl = this.answersArray.at(lastIndex);

    // If last input is empty, do nothing (let user fill it first)
    if (!lastCtrl || lastCtrl.value.trim().length === 0) return;

    this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
  }

  removeAnswer(index: number): void {
    this.answersArray.removeAt(index);
    if (this.answersArray.length === 0) {
      this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
    }
  }

  onAnswerEnter(index: number, event: Event): void {
    event.preventDefault();
    this.addAnswerOnIndex(index);

    this.focusLastAnswer();
  }

  private focusLastAnswer() {
    //this is to focus the newly added input (a secondary enter press needed to move to it), just UX improvement
    const inputs = document.querySelectorAll<HTMLInputElement>('.answers__list input');
    const newInput = inputs[inputs.length - 1];
    newInput?.focus();
  }

  private addAnswerOnIndex(index: number): void {
    const ctrl = this.answersArray.at(index);
    if (!ctrl) return;

    const value = ctrl.value.trim();
    const isLast = index === this.answersArray.length - 1;
    if (value.length === 0 || !isLast) return;
    this.answersArray.push(this.fb.nonNullable.control('', Validators.required));
  }

  onDrop(event: CdkDragDrop<FormControl<string>[]>): void {
    const from = event.previousIndex;
    const to = event.currentIndex;
    if (from === to) return;

    const control = this.answersArray.at(from);
    if (!control) return;

    this.answersArray.removeAt(from);
    this.answersArray.insert(to, control);

    // Update parent form validity if needed (parent might also call updateValueAndValidity)
    this.answersArray.updateValueAndValidity();
  }
}
