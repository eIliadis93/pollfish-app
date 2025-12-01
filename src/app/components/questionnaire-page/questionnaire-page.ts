import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';

import { QuestionnaireStore } from '../../core/store/questionnaire.store';
import { ViewportService } from '../../services/viewport.service';
import { Question } from '../../models/question.model';
import { QuestionDialogService } from '../../services/question-dialog.service';
import { QuestionItem } from '../question-item/question-item';

@Component({
  selector: 'app-questionnaire-page',
  standalone: true,
  imports: [NgClass, QuestionItem],
  templateUrl: './questionnaire-page.html',
  styleUrl: './questionnaire-page.scss',
})
export class QuestionnairePage {
  readonly store = inject(QuestionnaireStore);
  readonly viewport = inject(ViewportService);
  private readonly questionDialog = inject(QuestionDialogService);

  ngOnInit() {
    this.store.loadQuestionnaire();
  }

  openQuestionDialog(question: Question | null = null) {
    this.questionDialog.open(question);
  }

  addQuestion() {
    if (this.store.hasReachedLimit()) return;
    this.openQuestionDialog(null);
  }

  editQuestion(q: Question) {
    this.openQuestionDialog(q);
  }
}
