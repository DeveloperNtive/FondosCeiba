import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'fondos',
			},
			{
				path: 'fondos',
				title: 'Fondos',
				loadComponent: () =>
					import('./components/pages/funds/funds.page').then((m) => m.FundsPageComponent),
			},
			{
				path: 'transacciones',
				title: 'Transacciones',
				loadComponent: () =>
					import('./components/pages/transactions/transactions.page').then(
						(m) => m.TransactionsPageComponent,
					),
			},
		],
	},
	{
		path: '**',
		redirectTo: 'fondos',
	},
];
