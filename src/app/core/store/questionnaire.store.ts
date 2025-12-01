import { Injectable, computed, inject, signal } from '@angular/core';
import { PollfishApiService } from '../../services/pollfish-api.service';
import { Question } from '../../models/question.model';
import { RequestResult } from '../../models/request-result.model';
import { AppError } from '../../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class QuestionnaireStore {
  private readonly api = inject(PollfishApiService);

  readonly questions = signal<Question[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly hasLoaded = signal(false);
  readonly lastSavedAt = signal<number | null>(null);

  private readonly pendingSnapshot = signal<Question[] | null>(null);

  readonly hasPendingChanges = computed(() => this.pendingSnapshot() !== null);

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

  updateQuestions(mutator: (current: Question[]) => Question[]): void {
    const current = this.questions();
    const updated = mutator(current);
    this.questions.set(updated);

    if (this.isSaving()) {
      this.pendingSnapshot.set(updated);
      return;
    }

    this.saveCurrentSnapshot(updated);
  }

  addQuestion(newQuestion: Question): void {
    this.updateQuestions((qs) => [...qs, newQuestion]);
  }

  updateQuestionById(id: string, patch: Partial<Question>): void {
    this.updateQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  deleteQuestionById(id: string): void {
    this.updateQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  reorderQuestions(fromIndex: number, toIndex: number): void {
    this.updateQuestions((qs) => {
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
    this.saveCurrentSnapshot(snapshot);
  }

  private saveCurrentSnapshot(snapshot: Question[]): void {
    this.isSaving.set(true);

    this.api.saveQuestionnaire(snapshot).subscribe({
      next: (result: RequestResult<Question[]>) => {
        this.questions.set(result.data ?? snapshot);
        this.lastSavedAt.set(Date.now());
        this.isSaving.set(false);

        const pending = this.pendingSnapshot();
        if (pending) {
          // Requirement #7: "Save pending changes in the next update."
          this.pendingSnapshot.set(null);
          this.saveCurrentSnapshot(pending);
        }
      },

      error: (err: AppError) => {
        console.error('Failed to save questionnaire', err);

        this.pendingSnapshot.set(snapshot);
        this.isSaving.set(false);
      },
    });
  }
}
