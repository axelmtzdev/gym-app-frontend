import { Component, output } from '@angular/core';

@Component({
  selector: 'app-back-button',
  standalone: true,
  template: `
    <button
      type="button"
      aria-label="Volver"
      class="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-chalk-dim transition-colors hover:bg-surface hover:text-chalk"
      (click)="volver.emit()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
        <path d="M15 5 8 12l7 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  `,
})
export class BackButtonComponent {
  readonly volver = output<void>();
}
