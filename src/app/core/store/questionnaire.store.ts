import { Injectable, computed, inject, signal } from '@angular/core';
import { PollfishApiService } from '../../services/pollfish-api.service';
import { Question } from '../../models/question.model';
import { RequestResult } from '../../models/request-result.model';
import { AppError } from '../../models/app-error.model';
import { ToastService } from '../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class QuestionnaireStore {
  private readonly api = inject(PollfishApiService);
  private readonly toast = inject(ToastService);

  readonly questions = signal<Question[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly hasLoaded = signal(false);
  readonly lastSavedAt = signal<number | null>(null);

  private readonly pendingSnapshot = signal<Question[] | null>(null);
  readonly hasPendingChanges = computed(() => this.pendingSnapshot() !== null);

  readonly maxQuestions = 10;
  readonly questionsCount = computed(() => this.questions().length);
  readonly hasReachedLimit = computed(() => this.questionsCount() >= this.maxQuestions);

  loadQuestionnaire(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.api.loadQuestionnaire().subscribe({
      next: (result: RequestResult<Question[]>) => {
        this.questions.set(result.data ?? []);
        this.hasLoaded.set(true);
        this.isLoading.set(false);
      },
      error: (err: AppError) => {
        console.error('Failed to load questionnaire', err);
        this.isLoading.set(false);
      },
    });
  }

  private updateQuestionnaireSnapshot(mutator: (current: Question[]) => Question[]): void {
    const current = this.questions();
    const updated = mutator(current);
    this.questions.set(updated);

    if (this.isSaving()) {
      this.pendingSnapshot.set(updated);
      return;
    }

    this.saveQuestionnaireSnapshot(updated);
  }

  addQuestion(newQuestion: Question): void {
    if (this.hasReachedLimit()) {
      this.toast.warning('Μπορείς να έχεις μέχρι 10 ερωτήσεις.');
      return;
    }

    this.updateQuestionnaireSnapshot((qs) => [...qs, newQuestion]);
  }

  deleteQuestionById(id: string): void {
    this.updateQuestionnaireSnapshot((qs) => qs.filter((q) => q.id !== id));
  }

  reorderQuestions(fromIndex: number, toIndex: number): void {
    this.updateQuestionnaireSnapshot((qs) => {
      const clone = [...qs];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  }

  saveNow(): void {
    const snapshot = this.questions();
    if (this.isSaving()) {
      this.pendingSnapshot.set(snapshot);
      return;
    }
    this.saveQuestionnaireSnapshot(snapshot);
  }

  private saveQuestionnaireSnapshot(snapshot: Question[]): void {
    this.isSaving.set(true);

    this.api.saveQuestionnaire(snapshot).subscribe({
      next: (result: RequestResult<Question[]>) => {
        this.questions.set(result.data ?? snapshot);
        this.lastSavedAt.set(Date.now());
        this.isSaving.set(false);

        if (result.message && result.message.trim().length > 0) {
          this.toast.success(result.message);
        } else {
          this.toast.success('Το ερωτηματολόγιο αποθηκεύτηκε επιτυχώς.');
        }

        const pending = this.pendingSnapshot();
        if (pending) {
          // Requirement #7: "Save pending changes in the next update."
          this.pendingSnapshot.set(null);
          this.saveQuestionnaireSnapshot(pending);
        }
      },

      error: (err: AppError) => {
        console.error('Failed to save questionnaire', err);
        this.pendingSnapshot.set(snapshot);
        this.isSaving.set(false);
      },
    });
  }

  updateQuestionViaPut(updated: Question): void {
    if (!updated.id) {
      this.addQuestion(updated);
      return;
    }

    this.questions.update((qs) => qs.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)));

    const patch: Partial<Question> = {
      prompt: updated.prompt,
      answers: updated.answers,
    };

    this.api.updateQuestion(updated.id, patch).subscribe({
      next: (result: RequestResult<void>) => {
        if (result.message && result.message.trim().length > 0) {
          this.toast.info(result.message);
        }
      },
      error: (err: AppError) => {
        console.error('Failed to update question via PUT', err);
      },
    });
  }
}
