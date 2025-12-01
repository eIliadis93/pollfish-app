import { Component, inject } from '@angular/core';
import { QuestionnaireStore } from '../../../core/store/questionnaire.store';
import { Question } from '../../../models/question.model';
import { QuestionDialogService } from '../../../services/question-dialog.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly store = inject(QuestionnaireStore);
  readonly dialog = inject(QuestionDialogService);

  onSaveNow(): void {
    this.store.saveNow();
  }

  onAddQuestion(): void {
    this.dialog.open(null);
  }
}
