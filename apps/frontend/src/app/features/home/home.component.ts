import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalendarMonthComponent } from '../calendar/calendar-month/calendar-month.component';
import { CalendarWeekComponent } from '../calendar/calendar-week/calendar-week.component';

type ViewMode = 'month' | 'week';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CalendarMonthComponent, CalendarWeekComponent],
  template: `
    <div class="flex flex-col h-screen bg-gray-50">
      <!-- Top bar -->
      <header class="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold text-gray-800">SmartSchedule</h1>
        <div class="flex items-center gap-2">
          <div class="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              (click)="setView('month')"
              class="px-3 py-1.5 text-sm font-medium transition"
              [class.bg-blue-600]="viewMode() === 'month'"
              [class.text-white]="viewMode() === 'month'"
              [class.text-gray-600]="viewMode() !== 'month'"
            >
              Mês
            </button>
            <button
              (click)="setView('week')"
              class="px-3 py-1.5 text-sm font-medium transition"
              [class.bg-blue-600]="viewMode() === 'week'"
              [class.text-white]="viewMode() === 'week'"
              [class.text-gray-600]="viewMode() !== 'week'"
            >
              Semana
            </button>
          </div>
          <a
            routerLink="/schedules/new"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Nova
          </a>
        </div>
      </header>

      <!-- Calendar -->
      <main class="flex-1 overflow-hidden">
        @if (viewMode() === 'month') {
          <app-calendar-month />
        } @else {
          <app-calendar-week />
        }
      </main>

      <!-- Legend -->
      <footer class="bg-white border-t px-4 py-2 flex gap-4 text-xs overflow-x-auto">
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span class="w-3 h-3 rounded bg-green-200"></span>
          <span class="text-gray-600">Confirmado</span>
        </div>
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span class="w-3 h-3 rounded bg-yellow-200"></span>
          <span class="text-gray-600">Pendente</span>
        </div>
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span class="w-3 h-3 rounded bg-orange-200"></span>
          <span class="text-gray-600">Conflito</span>
        </div>
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span class="w-3 h-3 rounded bg-red-200"></span>
          <span class="text-gray-600">Cancelado</span>
        </div>
      </footer>
    </div>
  `,
})
export class HomeComponent {
  protected viewMode = signal<ViewMode>('month');

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }
}
