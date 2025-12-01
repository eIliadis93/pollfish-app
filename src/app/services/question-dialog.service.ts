import { ApplicationRef, EnvironmentInjector, Injectable, inject } from '@angular/core';
import { createComponent } from '@angular/core';
import { QuestionnaireStore } from '../core/store/questionnaire.store';
import { QuestionDialog } from '../components/features/question-dialog/question-dialog';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly store = inject(QuestionnaireStore);

  private dialogRef: ReturnType<typeof createComponent<QuestionDialog>> | null = null;

  private lastSnapshot: string | null = null;

  open(question: Question | null = null): void {
    this.close();
    this.lastSnapshot = this.createSnapshot(question ?? null);
    const ref = createComponent(QuestionDialog, {
      environmentInjector: this.envInjector,
    });

    this.dialogRef = ref;
    ref.instance.question = question;

    if (question) {
      ref.instance.autosave.subscribe((q) => {
        this.persist(q);
      });
    }

    ref.instance.save.subscribe((q) => {
      this.persist(q);
      this.close();
    });

    ref.instance.cancel.subscribe(() => {
      this.close();
    });

    this.appRef.attachView(ref.hostView);
    const domElem = (ref.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }

  close(): void {
    if (!this.dialogRef) return;

    this.appRef.detachView(this.dialogRef.hostView);
    this.dialogRef.destroy();
    this.dialogRef = null;
  }

  private normalizeQuestion(q: Question | null) {
    if (!q) return null;

    return {
      id: q.id ?? null,
      prompt: q.prompt.trim(),
      answers: (q.answers ?? []).map((a) => a.trim()).filter((a) => a.length > 0),
    };
  }

  private createSnapshot(q: Question | null): string | null {
    const normalized = this.normalizeQuestion(q);
    return normalized ? JSON.stringify(normalized) : null;
  }

  private isValidQuestion(q: Question): boolean {
    const normalized = this.normalizeQuestion(q);
    if (!normalized) return false;
    return normalized.prompt.length > 0 && normalized.answers.length >= 2;
  }

  private persist(q: Question): void {
    if (!this.isValidQuestion(q)) {
      return;
    }

    const snapshot = this.createSnapshot(q);

    if (snapshot === this.lastSnapshot) {
      return;
    }

    this.lastSnapshot = snapshot;

    if (q.id) {
      this.store.updateQuestionViaPut(q);
    } else {
      this.store.addQuestion(q);
    }
  }
}
