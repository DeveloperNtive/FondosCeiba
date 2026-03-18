import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TransactionService } from './transaction.service';
import { Transaction } from '../../../models/transaction.model';

describe('TransactionService', () => {
  let service: TransactionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TransactionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all transactions', () => {
    const mockTransactions: Transaction[] = [
      {
        id: 1,
        fundId: 1,
        type: 'SUBSCRIPTION',
        amount: 100000,
        date: new Date(),
      },
    ];

    service.getAll().subscribe((transactions) => {
      expect(transactions).toEqual(mockTransactions);
    });

    const req = httpMock.expectOne('/api/transactions');
    expect(req.request.method).toBe('GET');
    req.flush(mockTransactions);
  });

  it('should add a transaction', () => {
    const payload = {
      fundId: 2,
      type: 'CANCEL' as const,
      amount: 50000,
    };
    const mockResponse: Transaction = {
      id: 2,
      ...payload,
      date: new Date(),
    };

    service.add(payload).subscribe((transaction) => {
      expect(transaction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/transactions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should clear transactions', () => {
    service.clear().subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/transactions');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
