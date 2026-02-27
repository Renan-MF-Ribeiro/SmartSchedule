import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ISchedule, ScheduleStatus } from '@smartschedule/shared';
import { ScheduleService } from '../../../core/services/schedule.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  schedules: ISchedule[];
}

@Component({
  selector: 'app-calendar-month',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-white border-b">
        <button
          (click)="previousMonth()"
          class="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-gray-800">{{ monthLabel() }}</h2>
        <button
          (click)="nextMonth()"
          class="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Day Headers -->
      <div class="grid grid-cols-7 bg-gray-50 border-b">
        @for (day of dayNames; track day) {
          <div class="text-center text-xs font-medium text-gray-500 py-2">{{ day }}</div>
        }
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 flex-1 border-l border-t">
        @for (day of calendarDays(); track day.date.toISOString()) {
          <div
            class="border-r border-b min-h-[80px] p-1 cursor-pointer hover:bg-gray-50 transition"
            [class.bg-gray-100]="!day.isCurrentMonth"
            (click)="onDayClick(day)"
          >
            <span
              class="inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1"
              [class.bg-blue-600]="day.isToday"
              [class.text-white]="day.isToday"
              [class.text-gray-400]="!day.isCurrentMonth"
              [class.font-semibold]="day.isToday"
            >
              {{ day.date.getDate() }}
            </span>
            <div class="space-y-0.5">
              @for (schedule of day.schedules.slice(0, 2); track schedule.id) {
                <div
                  class="text-xs px-1 py-0.5 rounded truncate"
                  [class]="getScheduleClass(schedule.status)"
                >
                  {{ schedule.startTime }} {{ schedule.title }}
                </div>
              }
              @if (day.schedules.length > 2) {
                <div class="text-xs text-gray-500 pl-1">+{{ day.schedules.length - 2 }} mais</div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CalendarMonthComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);

  readonly dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  protected currentDate = signal(new Date());
  protected schedules = signal<ISchedule[]>([]);

  protected monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  protected calendarDays = computed((): CalendarDay[] => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    // Fill previous month days
    for (let i = firstDay.getDay(); i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({ date, isCurrentMonth: false, isToday: false, schedules: [] });
    }

    // Fill current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const daySchedules = this.schedules().filter(s => s.date === dateStr);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        schedules: daySchedules,
      });
    }

    // Fill next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false, schedules: [] });
    }

    return days;
  });

  ngOnInit(): void {
    this.loadSchedules();
  }

  protected previousMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.loadSchedules();
  }

  protected nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.loadSchedules();
  }

  protected onDayClick(day: CalendarDay): void {
    console.log('Day clicked:', day.date);
  }

  protected getScheduleClass(status: ScheduleStatus): string {
    const map: Record<ScheduleStatus, string> = {
      [ScheduleStatus.CONFIRMED]: 'bg-green-100 text-green-800',
      [ScheduleStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ScheduleStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [ScheduleStatus.CONFLICT]: 'bg-orange-100 text-orange-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }

  private loadSchedules(): void {
    const d = this.currentDate();
    this.scheduleService
      .getByMonth(d.getFullYear(), d.getMonth() + 1)
      .subscribe(schedules => this.schedules.set(schedules));
  }
}
