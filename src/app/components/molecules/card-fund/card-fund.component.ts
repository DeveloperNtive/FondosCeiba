import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Fund } from '../../../models/fund.model';
import { FUND_NAME_MAP } from '../../../shared/constants/fund-name.map';

@Component({
  selector: 'app-card-fund',
  imports: [CurrencyPipe],
  templateUrl: './card-fund.component.html',
  styleUrl: './card-fund.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFundComponent {
  readonly funds = input<Fund[]>([]);
  readonly selectedFundId = input<number | null>(null);
  readonly fundSelected = output<Fund>();

  readonly fundNameMap = FUND_NAME_MAP;

  selectFund(fund: Fund): void {
    this.fundSelected.emit(fund);
  }

  getFundDisplayName(name: string): string {
    return this.fundNameMap[name as keyof typeof FUND_NAME_MAP] ?? name;
  }
}
