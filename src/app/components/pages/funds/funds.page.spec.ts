import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FundService } from '../../../core/services/fund/fund.service';
import { UserService } from '../../../core/services/user/user.service';
import { Fund } from '../../../models/fund.model';
import { FundsPageComponent } from './funds.page';

describe('FundsPageComponent', () => {
  const fundsMock: Fund[] = [
    { id: 1, name: 'FPV_TEST', display_name: 'FPV TEST', minAmount: 50000, category: 'FPV' },
    { id: 2, name: 'FIC_TEST', display_name: 'FIC TEST', minAmount: 100000, category: 'FIC' },
  ];

  let fundServiceSpy: Pick<FundService, 'getFunds' | 'subscribeToFund' | 'cancelFund'>;
  let userServiceSpy: Pick<UserService, 'getBalance'>;

  beforeEach(async () => {
    fundServiceSpy = {
      getFunds: vi.fn(),
      subscribeToFund: vi.fn(),
      cancelFund: vi.fn(),
    };

    userServiceSpy = {
      getBalance: vi.fn(),
    };

    vi.mocked(fundServiceSpy.getFunds).mockReturnValue(of(fundsMock));
    vi.mocked(fundServiceSpy.subscribeToFund).mockReturnValue(
      of({
        id: 1,
        fundId: 1,
        amount: 50000,
        type: 'SUBSCRIPTION',
        date: new Date(),
      }),
    );
    vi.mocked(fundServiceSpy.cancelFund).mockReturnValue(
      of({
        id: 2,
        fundId: 1,
        amount: 50000,
        type: 'CANCEL',
        date: new Date(),
      }),
    );
    vi.mocked(userServiceSpy.getBalance).mockReturnValue(of(500000));

    await TestBed.configureTestingModule({
      imports: [FundsPageComponent],
      providers: [
        { provide: FundService, useValue: fundServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();
  });

  it('should create and load initial data', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fundServiceSpy.getFunds).toHaveBeenCalled();
    expect(userServiceSpy.getBalance).toHaveBeenCalled();
    expect(component.funds()).toEqual(fundsMock);
    expect(component.selectedFundId()).toBe(1);
    expect(component.amountControl.value).toBe(50000);
  });

  it('should subscribe successfully and refresh balance', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance;

    component.amountControl.setValue(75000);
    component.subscribe();

    expect(fundServiceSpy.subscribeToFund).toHaveBeenCalledWith(fundsMock[0], 75000);
    expect(component.successMessage()).toBe('Suscripcion realizada correctamente.');
    expect(component.actionInProgress()).toBe(false);
    expect(userServiceSpy.getBalance).toHaveBeenCalledTimes(2);
  });

  it('should not subscribe when no fund is selected', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance;

    component.selectedFundId.set(null);
    component.subscribe();

    expect(fundServiceSpy.subscribeToFund).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Selecciona un fondo antes de continuar.');
  });

  it('should set backend error message on subscribe failure', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance;

    vi.mocked(fundServiceSpy.subscribeToFund).mockReturnValue(
      throwError(() => ({ error: { message: 'Saldo insuficiente para realizar la suscripcion.' } })),
    );

    component.amountControl.setValue(2000000);
    component.subscribe();

    expect(component.errorMessage()).toBe('Saldo insuficiente para realizar la suscripcion.');
    expect(component.actionInProgress()).toBe(false);
  });

  it('should cancel successfully', () => {
    const fixture = TestBed.createComponent(FundsPageComponent);
    const component = fixture.componentInstance;

    component.amountControl.setValue(30000);
    component.cancel();

    expect(fundServiceSpy.cancelFund).toHaveBeenCalledWith(fundsMock[0], 30000);
    expect(component.successMessage()).toBe('Cancelacion registrada correctamente.');
    expect(component.actionInProgress()).toBe(false);
  });
});
