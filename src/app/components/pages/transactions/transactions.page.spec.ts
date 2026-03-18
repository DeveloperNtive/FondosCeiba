import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TransactionService } from '../../../core/services/transaction/transaction.service';
import { Transaction } from '../../../models/transaction.model';
import { TransactionsPageComponent } from './transactions.page';

describe('TransactionsPageComponent', () => {
  const transactionsMock: Transaction[] = [
    { id: 1, fundId: 1, type: 'SUBSCRIPTION', amount: 100000, date: new Date() },
    { id: 2, fundId: 1, type: 'CANCEL', amount: 50000, date: new Date() },
  ];

  let transactionServiceSpy: Pick<TransactionService, 'getAll' | 'clear'>;

  beforeEach(async () => {
    transactionServiceSpy = {
      getAll: vi.fn(),
      clear: vi.fn(),
    };

    vi.mocked(transactionServiceSpy.getAll).mockReturnValue(of(transactionsMock));
    vi.mocked(transactionServiceSpy.clear).mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [TransactionsPageComponent],
      providers: [{ provide: TransactionService, useValue: transactionServiceSpy }],
    }).compileComponents();
  });

  it('should create and load transactions', () => {
    const fixture = TestBed.createComponent(TransactionsPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(transactionServiceSpy.getAll).toHaveBeenCalled();
    expect(component.transactions()).toEqual(transactionsMock);
    expect(component.loading()).toBe(false);
  });

  it('should clear history successfully', () => {
    const fixture = TestBed.createComponent(TransactionsPageComponent);
    const component = fixture.componentInstance;

    component.clearHistory();

    expect(transactionServiceSpy.clear).toHaveBeenCalled();
    expect(component.transactions()).toEqual([]);
    expect(component.clearing()).toBe(false);
  });

  it('should set error message when clear fails', () => {
    const fixture = TestBed.createComponent(TransactionsPageComponent);
    const component = fixture.componentInstance;

    vi.mocked(transactionServiceSpy.clear).mockReturnValue(throwError(() => new Error('fail')));

    component.clearHistory();

    expect(component.errorMessage()).toBe('No fue posible limpiar las transacciones.');
    expect(component.clearing()).toBe(false);
  });

  it('should set error message when initial load fails', async () => {
    vi.mocked(transactionServiceSpy.getAll).mockReturnValue(throwError(() => new Error('fail')));

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TransactionsPageComponent],
      providers: [{ provide: TransactionService, useValue: transactionServiceSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(TransactionsPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.errorMessage()).toBe('No fue posible cargar el historial de transacciones.');
    expect(component.loading()).toBe(false);
  });
});
