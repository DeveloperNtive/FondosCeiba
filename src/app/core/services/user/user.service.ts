import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userApiUrl = '/api/user';

  getUser(): Observable<User> {
    return this.http.get<User>(this.userApiUrl);
  }

  getBalance(): Observable<number> {
    return this.getUser().pipe(map((user) => user.balance));
  }

  updateBalance(amount: number): Observable<User> {
    return this.http.patch<User>(this.userApiUrl, { balance: amount });
  }
}
