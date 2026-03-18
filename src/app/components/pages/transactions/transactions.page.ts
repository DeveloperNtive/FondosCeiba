import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Transaction } from '../../../models/transaction.model';
import { TransactionService } from '../../../core/services/transaction/transaction.service';

@Component({
  selector: 'app-transactions-page',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPageComponent {
  private readonly transactionService = inject(TransactionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly transactions = signal<Transaction[]>([]);
  readonly loading = signal(true);
  readonly clearing = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadTransactions();
  }

  clearHistory(): void {
    this.errorMessage.set('');
    this.clearing.set(true);

    this.transactionService
      .clear()
      .pipe(
        finalize(() => this.clearing.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.transactions.set([]);
        },
        error: () => {
          this.errorMessage.set('No fue posible limpiar las transacciones.');
        },
      });
  }

  private loadTransactions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.transactionService
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (transactions) => this.transactions.set(transactions),
        error: () => {
          this.errorMessage.set('No fue posible cargar el historial de transacciones.');
        },
      });
  }
}