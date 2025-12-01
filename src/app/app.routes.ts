import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/questionnaire-page/questionnaire-page').then((m) => m.QuestionnairePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
