import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FundService } from './fund.service';
import { Fund } from '../../../models/fund.model';
import { Transaction } from '../../../models/transaction.model';

describe('FundService', () => {
  let service: FundService;
  let httpMock: HttpTestingController;

  const mockFund: Fund = {
    id: 1,
    name: 'FPV_TEST',
    display_name: 'FPV TEST',
    minAmount: 50000,
    category: 'FPV',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FundService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch funds', () => {
    const mockFunds: Fund[] = [mockFund];

    service.getFunds().subscribe((funds) => {
      expect(funds).toEqual(mockFunds);
    });

    const req = httpMock.expectOne('/api/funds');
    expect(req.request.method).toBe('GET');
    req.flush(mockFunds);
  });

  it('should subscribe to a fund', () => {
    const amount = 80000;
    const mockResponse: Transaction = {
      id: 10,
      fundId: mockFund.id,
      type: 'SUBSCRIPTION',
      amount,
      date: new Date(),
    };

    service.subscribeToFund(mockFund, amount).subscribe((transaction) => {
      expect(transaction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/funds/${mockFund.id}/subscribe`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount });
    req.flush(mockResponse);
  });

  it('should cancel a fund subscription', () => {
    const amount = 30000;
    const mockResponse: Transaction = {
      id: 11,
      fundId: mockFund.id,
      type: 'CANCEL',
      amount,
      date: new Date(),
    };

    service.cancelFund(mockFund, amount).subscribe((transaction) => {
      expect(transaction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/funds/${mockFund.id}/cancel`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount });
    req.flush(mockResponse);
  });
});
