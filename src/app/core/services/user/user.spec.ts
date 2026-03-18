import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../../../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user data', () => {
    const mockUser: User = { balance: 500000 };

    service.getUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/user');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should get balance from user response', () => {
    service.getBalance().subscribe((balance) => {
      expect(balance).toBe(420000);
    });

    const req = httpMock.expectOne('/api/user');
    expect(req.request.method).toBe('GET');
    req.flush({ balance: 420000 });
  });

  it('should update balance', () => {
    const newBalance = 350000;
    const mockResponse: User = { balance: newBalance };

    service.updateBalance(newBalance).subscribe((user) => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/user');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ balance: newBalance });
    req.flush(mockResponse);
  });
});
