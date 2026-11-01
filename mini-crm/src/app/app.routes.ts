import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/companies/company-list/company-list').then((m) => m.CompanyList),
  },
  {
    path: 'companies/new',
    loadComponent: () => import('./components/companies/company-new/company-new').then((m) => m.CompanyNew),
  },
  { path: '**', redirectTo: '' },
];
