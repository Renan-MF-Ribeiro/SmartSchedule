import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecaptchaVerifier } from '@angular/fire/auth';
import { AuthService } from '../../../core/services/auth.service';
import { Auth } from '@angular/fire/auth';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-2">SmartSchedule</h1>
        <p class="text-center text-gray-500 mb-8">Gerenciador de Escalas</p>

        @if (!otpSent()) {
          <form [formGroup]="phoneForm" (ngSubmit)="sendOtp()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                formControlName="phone"
                type="tel"
                placeholder="+55 11 99999-9999"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div id="recaptcha-container"></div>
            <button
              type="submit"
              [disabled]="phoneForm.invalid || loading()"
              class="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {{ loading() ? 'Enviando...' : 'Receber código' }}
            </button>
          </form>
        } @else {
          <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código OTP</label>
              <input
                formControlName="code"
                type="text"
                placeholder="123456"
                maxlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              [disabled]="otpForm.invalid || loading()"
              class="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {{ loading() ? 'Verificando...' : 'Entrar' }}
            </button>
            <button
              type="button"
              (click)="back()"
              class="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Voltar
            </button>
          </form>
        }
      </div>
    </div>
    <p-toast />
  `,
})
export class LoginComponent implements AfterViewInit {
  protected otpSent = signal(false);
  protected loading = signal(false);
  private recaptchaVerifier?: RecaptchaVerifier;

  phoneForm: FormGroup;
  otpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private auth: Auth,
    private messageService: MessageService,
  ) {
    this.phoneForm = this.fb.group({ phone: ['', [Validators.required]] });
    this.otpForm = this.fb.group({ code: ['', [Validators.required, Validators.minLength(6)]] });
  }

  ngAfterViewInit(): void {
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
      size: 'invisible',
    });
  }

  async sendOtp(): Promise<void> {
    if (this.phoneForm.invalid || !this.recaptchaVerifier) return;
    this.loading.set(true);
    try {
      await this.authService.sendOtp(this.phoneForm.value.phone, this.recaptchaVerifier);
      this.otpSent.set(true);
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao enviar OTP' });
    } finally {
      this.loading.set(false);
    }
  }

  async verifyOtp(): Promise<void> {
    if (this.otpForm.invalid) return;
    this.loading.set(true);
    try {
      await this.authService.verifyOtp(this.otpForm.value.code);
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Código inválido' });
    } finally {
      this.loading.set(false);
    }
  }

  back(): void {
    this.otpSent.set(false);
  }
}
