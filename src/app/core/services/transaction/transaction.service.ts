import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../../../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly transactionsApiUrl = '/api/transactions';

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.transactionsApiUrl);
  }

  add(transaction: Omit<Transaction, 'id' | 'date'>): Observable<Transaction> {
    return this.http.post<Transaction>(this.transactionsApiUrl, transaction);
  }

  clear(): Observable<void> {
    return this.http.delete<void>(this.transactionsApiUrl);
  }
}
