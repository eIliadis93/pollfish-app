import { Component, inject } from '@angular/core';
import { QuestionnaireStore } from '../../core/store/questionnaire.store';
import { ViewportService } from '../../services/viewport.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-questionnaire-page',
  imports: [NgClass],
  templateUrl: './questionnaire-page.html',
  styleUrl: './questionnaire-page.scss',
})
export class QuestionnairePage {
  readonly store = inject(QuestionnaireStore);
  readonly viewport = inject(ViewportService);

  ngOnInit() {
    this.store.loadQuestionnaire();
  }

  addQuestion() {}
}
