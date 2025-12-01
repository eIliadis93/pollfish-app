import { Component, inject } from '@angular/core';
import { QuestionnaireStore } from '../../../core/store/questionnaire.store';
import { Question } from '../../../models/question.model';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly store = inject(QuestionnaireStore);

  onSaveNow(): void {
    this.store.saveNow();
  }

  onAddQuestion(): void {
    const newQuestion: Question = {
      prompt: '',
      answers: [''],
    };

    this.store.addQuestion(newQuestion);
  }
}
