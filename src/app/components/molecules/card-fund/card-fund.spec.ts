import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFundComponent } from './card-fund.component';
import { Fund } from '../../../models/fund.model';

describe('CardFundComponent', () => {
  let component: CardFundComponent;
  let fixture: ComponentFixture<CardFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardFundComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all received funds', () => {
    const funds: Fund[] = [
      { id: 1, name: 'FPV_A', display_name: 'FPV A', minAmount: 50000, category: 'FPV' },
      { id: 2, name: 'FIC_B', display_name: 'FIC B', minAmount: 100000, category: 'FIC' },
    ];

    fixture.componentRef.setInput('funds', funds);
    fixture.componentRef.setInput('selectedFundId', 1);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.fund-card');
    expect(cards.length).toBe(2);
    expect(cards[0].classList.contains('is-selected')).toBe(true);
  });
});
