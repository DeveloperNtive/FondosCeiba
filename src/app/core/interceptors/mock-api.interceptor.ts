import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Fund } from '../../models/fund.model';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';

const NETWORK_DELAY_MS = 500;
const INITIAL_USER_BALANCE = 500000;

const fundsState: Fund[] = [
  { id: 1, name: 'FPV_BTG_PACTUAL_RECAUDADORA', minAmount: 75000, category: 'FPV' },
  { id: 2, name: 'FPV_BTG_PACTUAL_ECOPETROL', minAmount: 125000, category: 'FPV' },
  { id: 3, name: 'DEUDAPRIVADA', minAmount: 50000, category: 'FIC' },
  { id: 4, name: 'FDO-ACCIONES', minAmount: 250000, category: 'FIC' },
  { id: 5, name: 'FPV_BTG_PACTUAL_DINAMICA', minAmount: 100000, category: 'FPV' },
];

let userState: User = { balance: INITIAL_USER_BALANCE };
let transactionsState: Transaction[] = [];
let nextTransactionId = 1;
const subscribedAmountByFund = new Map<number, number>();

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const cleanUrl = req.url.split('?')[0];

  if (!cleanUrl.startsWith('/api/')) {
    return next(req);
  }

  if (req.method === 'GET' && cleanUrl === '/api/funds') {
    return ok(fundsState);
  }

  if (req.method === 'GET' && cleanUrl === '/api/user') {
    return ok(userState);
  }

  if (req.method === 'PATCH' && cleanUrl === '/api/user') {
    const body = req.body as Partial<User> | null;
    const incomingBalance = body?.balance;

    if (typeof incomingBalance !== 'number' || Number.isNaN(incomingBalance) || incomingBalance < 0) {
      return badRequest('El balance debe ser un numero mayor o igual a 0.');
    }

    userState = { ...userState, balance: incomingBalance };
    return ok(userState);
  }

  if (req.method === 'GET' && cleanUrl === '/api/transactions') {
    return ok(transactionsState);
  }

  if (req.method === 'POST' && cleanUrl === '/api/transactions') {
    const body = req.body as Omit<Transaction, 'id' | 'date'> | null;

    if (
      !body ||
      typeof body.fundId !== 'number' ||
      typeof body.amount !== 'number' ||
      (body.type !== 'SUBSCRIPTION' && body.type !== 'CANCEL')
    ) {
      return badRequest('Payload de transaccion invalido.');
    }

    const fund = fundsState.find((item) => item.id === body.fundId);
    if (!fund) {
      return notFound('Fondo no encontrado.');
    }

    if (body.amount <= 0 || Number.isNaN(body.amount)) {
      return badRequest('El monto debe ser un numero mayor a 0.');
    }

    if (body.type === 'SUBSCRIPTION') {
      if (body.amount < fund.minAmount) {
        return badRequest('Monto minimo no alcanzado para este fondo.');
      }

      if (body.amount > userState.balance) {
        return badRequest('Saldo insuficiente para realizar la suscripcion.');
      }

      userState = { ...userState, balance: userState.balance - body.amount };
      const currentAmount = subscribedAmountByFund.get(body.fundId) ?? 0;
      subscribedAmountByFund.set(body.fundId, currentAmount + body.amount);
    }

    if (body.type === 'CANCEL') {
      const currentAmount = subscribedAmountByFund.get(body.fundId) ?? 0;

      if (currentAmount <= 0) {
        return badRequest('No tienes una suscripcion activa en este fondo.');
      }

      if (body.amount > currentAmount) {
        return badRequest('El monto a cancelar supera tu suscripcion activa en este fondo.');
      }

      subscribedAmountByFund.set(body.fundId, currentAmount - body.amount);
      userState = { ...userState, balance: userState.balance + body.amount };
    }

    const transaction: Transaction = {
      ...body,
      id: nextTransactionId++,
      date: new Date(),
    };

    transactionsState = [transaction, ...transactionsState];
    return ok(transaction, 201);
  }

  if (req.method === 'DELETE' && cleanUrl === '/api/transactions') {
    transactionsState = [];
    userState = { balance: INITIAL_USER_BALANCE };
    nextTransactionId = 1;
    subscribedAmountByFund.clear();
    return ok(undefined, 204);
  }

  const fundActionMatch = cleanUrl.match(/^\/api\/funds\/(\d+)\/(subscribe|cancel)$/);
  if (req.method === 'POST' && fundActionMatch) {
    const fundId = Number(fundActionMatch[1]);
    const action = fundActionMatch[2];
    const body = req.body as { amount?: number; notificationMethod?: 'EMAIL' | 'SMS' } | null;
    const amount = body?.amount;
    const notificationMethod = body?.notificationMethod;

    const fund = fundsState.find((item) => item.id === fundId);
    if (!fund) {
      return notFound('Fondo no encontrado.');
    }

    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return badRequest('El monto debe ser un numero mayor a 0.');
    }

    if (action === 'subscribe') {
      if (amount < fund.minAmount) {
        return badRequest('Monto minimo no alcanzado para este fondo.');
      }

      if (amount > userState.balance) {
        return badRequest('Saldo insuficiente para realizar la suscripcion.');
      }

      userState = { ...userState, balance: userState.balance - amount };
      const currentAmount = subscribedAmountByFund.get(fundId) ?? 0;
      subscribedAmountByFund.set(fundId, currentAmount + amount);
    }

    if (action === 'cancel') {
      const currentAmount = subscribedAmountByFund.get(fundId) ?? 0;

      if (currentAmount <= 0) {
        return badRequest('No tienes una suscripcion activa en este fondo.');
      }

      if (amount > currentAmount) {
        return badRequest('El monto a cancelar supera tu suscripcion activa en este fondo.');
      }

      subscribedAmountByFund.set(fundId, currentAmount - amount);
      userState = { ...userState, balance: userState.balance + amount };
    }

    const transaction: Transaction = {
      id: nextTransactionId++,
      fundId,
      amount,
      type: action === 'subscribe' ? 'SUBSCRIPTION' : 'CANCEL',
      date: new Date(),
      ...(action === 'subscribe' && notificationMethod ? { notificationMethod } : {}),
    };

    transactionsState = [transaction, ...transactionsState];
    return ok(transaction, 201);
  }

  return next(req);
};

function ok<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse<T>({ status, body })).pipe(delay(NETWORK_DELAY_MS));
}

function badRequest(message: string): Observable<never> {
  return httpError(400, message);
}

function notFound(message: string): Observable<never> {
  return httpError(404, message);
}

function httpError(status: number, message: string): Observable<never> {
  return throwError(() =>
    new HttpErrorResponse({
      status,
      error: { message },
    }),
  ).pipe(delay(NETWORK_DELAY_MS));
}