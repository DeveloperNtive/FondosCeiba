import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Fund } from '../../../models/fund.model';
import { FundService } from '../../../core/services/fund/fund.service';
import { UserService } from '../../../core/services/user/user.service';
import { CardFundComponent } from '../../molecules/card-fund/card-fund.component';
import { FUND_NAME_MAP } from '../../../shared/constants/fund-name.map';

@Component({
  selector: 'app-funds-page',
  imports: [CurrencyPipe, ReactiveFormsModule, CardFundComponent],
  templateUrl: './funds.page.html',
  styleUrl: './funds.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FundsPageComponent {
  private readonly fundService = inject(FundService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly funds = signal<Fund[]>([]);
  readonly selectedFundId = signal<number | null>(null);
  readonly loadingFunds = signal(true);
  readonly loadingBalance = signal(true);
  readonly userBalance = signal(0);
  readonly actionInProgress = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly notificationMethod = signal<'EMAIL' | 'SMS'>('EMAIL');

  readonly fundNameMap = FUND_NAME_MAP;

  readonly amountControl = new FormControl(0, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(1)],
  });

  constructor() {
    this.loadFunds();
    this.loadBalance();
  }

  get selectedFund(): Fund | undefined {
    const selectedId = this.selectedFundId();
    return this.funds().find((fund) => fund.id === selectedId);
  }

  selectFund(fund: Fund): void {
    this.selectedFundId.set(fund.id);
    this.amountControl.setValue(fund.minAmount);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  subscribe(): void {
    const fund = this.selectedFund;
    const amount = this.amountControl.value;

    if (!fund) {
      this.errorMessage.set('Selecciona un fondo antes de continuar.');
      return;
    }

    this.actionInProgress.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.fundService
      .subscribeToFund(fund, amount, this.notificationMethod())
      .pipe(
        finalize(() => this.actionInProgress.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Suscripcion realizada correctamente.');
          this.loadBalance();
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'No fue posible suscribirse al fondo.');
        },
      });
  }

  cancel(): void {
    const fund = this.selectedFund;
    const amount = this.amountControl.value;

    if (!fund) {
      this.errorMessage.set('Selecciona un fondo antes de continuar.');
      return;
    }

    this.actionInProgress.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.fundService
      .cancelFund(fund, amount)
      .pipe(
        finalize(() => this.actionInProgress.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Cancelacion registrada correctamente.');
          this.loadBalance();
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'No fue posible cancelar la suscripcion.');
        },
      });
  }

  private loadFunds(): void {
    this.loadingFunds.set(true);

    this.fundService
      .getFunds()
      .pipe(
        finalize(() => this.loadingFunds.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (funds) => {
          this.funds.set(funds);

          if (!this.selectedFundId() && funds.length > 0) {
            this.selectFund(funds[0]);
          }
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'No fue posible cargar los fondos.');
        },
      });
  }

  private loadBalance(): void {
    this.loadingBalance.set(true);

    this.userService
      .getBalance()
      .pipe(
        finalize(() => this.loadingBalance.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (balance) => this.userBalance.set(balance),
        error: () => this.errorMessage.set('No fue posible cargar el balance del usuario.'),
      });
  }

  getFundDisplayName(name: string): string {
    return this.fundNameMap[name as keyof typeof FUND_NAME_MAP] ?? name;
  }
}