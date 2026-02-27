import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISchedule } from '@smartschedule/shared';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/schedules`;

  getByMonth(year: number, month: number): Observable<ISchedule[]> {
    return this.http.get<ISchedule[]>(this.baseUrl, { params: { year, month } });
  }

  getByDateRange(start: string, end: string): Observable<ISchedule[]> {
    return this.http.get<ISchedule[]>(`${this.baseUrl}/range`, { params: { start, end } });
  }

  getById(id: string): Observable<ISchedule> {
    return this.http.get<ISchedule>(`${this.baseUrl}/${id}`);
  }

  create(schedule: Partial<ISchedule>): Observable<ISchedule> {
    return this.http.post<ISchedule>(this.baseUrl, schedule);
  }

  update(id: string, schedule: Partial<ISchedule>): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, schedule);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addComment(scheduleId: string, content: string, userName: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${scheduleId}/comments`, { content, userName });
  }
}
