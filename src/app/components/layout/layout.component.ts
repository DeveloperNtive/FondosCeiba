import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, startWith, switchMap } from 'rxjs';
import { UserService } from '../../core/services/user/user.service';

@Component({
  selector: 'app-layout',
  imports: [CurrencyPipe, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly balance = signal<number | null>(null);
  readonly currentYear = new Date().getFullYear();

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        switchMap(() => this.userService.getBalance()),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (balance) => this.balance.set(balance),
        error: () => this.balance.set(null),
      });
  }
}