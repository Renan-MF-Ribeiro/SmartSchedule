import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ScheduleService } from '../../core/services/schedule.service';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="max-w-2xl mx-auto p-4">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        {{ isEdit() ? 'Editar Escala' : 'Nova Escala' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            formControlName="title"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            formControlName="description"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input
              formControlName="date"
              type="date"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Início *</label>
            <input
              formControlName="startTime"
              type="time"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
            <input
              formControlName="endTime"
              type="time"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Positions -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">Posições</label>
            <button
              type="button"
              (click)="addPosition()"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Adicionar posição
            </button>
          </div>
          <div formArrayName="positions" class="space-y-3">
            @for (pos of positions.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="flex gap-2 items-center p-3 bg-gray-50 rounded-xl">
                <span class="text-sm font-medium text-gray-500 w-6">{{ i + 1 }}</span>
                <input
                  formControlName="label"
                  type="text"
                  placeholder="Ex: Vocal"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  formControlName="userPhone"
                  type="tel"
                  placeholder="Telefone"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  (click)="removePosition(i)"
                  class="text-red-500 hover:text-red-700 p-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            (click)="cancel()"
            class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {{ loading() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
    <p-toast />
  `,
})
export class ScheduleFormComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected isEdit = signal(false);
  protected loading = signal(false);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      teamId: [''],
      positions: this.fb.array([]),
    });
    this.addPosition();
  }

  get positions(): FormArray {
    return this.form.get('positions') as FormArray;
  }

  addPosition(): void {
    const group = this.fb.group({
      id: [crypto.randomUUID()],
      label: ['', Validators.required],
      order: [this.positions.length],
      userPhone: [''],
      userId: [''],
    });
    this.positions.push(group);
  }

  removePosition(index: number): void {
    this.positions.removeAt(index);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.scheduleService.create(this.form.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Escala criada!' });
        this.router.navigate(['/']);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar escala' });
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
