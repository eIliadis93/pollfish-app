import { Component, Input, signal, inject } from '@angular/core';
import { Question } from '../../models/question.model';
import { QuestionnaireStore } from '../../core/store/questionnaire.store';
import { QuestionDialogService } from '../../services/question-dialog.service';

@Component({
  selector: 'app-question-item',
  standalone: true,
  imports: [],
  templateUrl: './question-item.html',
  styleUrl: './question-item.scss',
})
export class QuestionItem {
  @Input({ required: true }) question!: Question;

  private readonly dialog = inject(QuestionDialogService);
  private readonly store = inject(QuestionnaireStore);

  readonly expanded = signal(false);

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  editQuestion(): void {
    this.dialog.open(this.question);
  }

  deleteQuestion(): void {
    if (!this.question?.id) {
      return;
    }

    this.store.deleteQuestionById(this.question.id);
  }

  answersCountLabel(): string {
    const count = this.question.answers?.length ?? 0;
    if (count === 0) return 'No answers';
    if (count === 1) return '1 answer';
    return `${count} answers`;
  }
}
