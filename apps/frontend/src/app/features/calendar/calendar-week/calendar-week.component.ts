import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISchedule, ScheduleStatus } from '@smartschedule/shared';
import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-calendar-week',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between p-4 bg-white border-b">
        <button (click)="previousWeek()" class="p-2 rounded-full hover:bg-gray-100 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 class="text-lg font-semibold text-gray-800">{{ weekLabel() }}</h2>
        <button (click)="nextWeek()" class="p-2 rounded-full hover:bg-gray-100 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-7 border-b bg-gray-50">
        @for (day of weekDays(); track day.date.toISOString()) {
          <div class="flex flex-col items-center py-2">
            <span class="text-xs text-gray-500">{{ day.label }}</span>
            <span
              class="w-8 h-8 flex items-center justify-center text-sm rounded-full mt-1"
              [class.bg-blue-600]="day.isToday"
              [class.text-white]="day.isToday"
            >
              {{ day.date.getDate() }}
            </span>
          </div>
        }
      </div>

      <div class="grid grid-cols-7 flex-1 border-l overflow-auto">
        @for (day of weekDays(); track day.date.toISOString()) {
          <div class="border-r p-2 space-y-2">
            @for (schedule of day.schedules; track schedule.id) {
              <div
                class="p-2 rounded-lg text-xs cursor-pointer"
                [class]="getScheduleClass(schedule.status)"
              >
                <div class="font-semibold">{{ schedule.startTime }}</div>
                <div class="truncate">{{ schedule.title }}</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class CalendarWeekComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  protected currentWeekStart = signal(this.getWeekStart(new Date()));
  protected schedules = signal<ISchedule[]>([]);

  protected weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  });

  protected weekDays = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(this.currentWeekStart());
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date,
        label: this.dayLabels[i],
        isToday: date.getTime() === today.getTime(),
        schedules: this.schedules().filter(s => s.date === dateStr),
      };
    });
  });

  ngOnInit(): void {
    this.loadSchedules();
  }

  protected previousWeek(): void {
    const start = new Date(this.currentWeekStart());
    start.setDate(start.getDate() - 7);
    this.currentWeekStart.set(start);
    this.loadSchedules();
  }

  protected nextWeek(): void {
    const start = new Date(this.currentWeekStart());
    start.setDate(start.getDate() + 7);
    this.currentWeekStart.set(start);
    this.loadSchedules();
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

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private loadSchedules(): void {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    this.scheduleService
      .getByDateRange(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
      )
      .subscribe(schedules => this.schedules.set(schedules));
  }
}
