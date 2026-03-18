import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fund } from '../../../models/fund.model';
import { Transaction } from '../../../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class FundService {
  private readonly http = inject(HttpClient);
  private readonly fundsApiUrl = '/api/funds';

  getFunds(): Observable<Fund[]> {
    return this.http.get<Fund[]>(this.fundsApiUrl);
  }

  subscribeToFund(fund: Fund, amount: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.fundsApiUrl}/${fund.id}/subscribe`, {
      amount,
    });
  }

  cancelFund(fund: Fund, amount: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.fundsApiUrl}/${fund.id}/cancel`, {
      amount,
    });
  }
}
