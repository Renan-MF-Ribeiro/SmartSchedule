import { Injectable, signal } from '@angular/core';
import { Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private confirmationResult?: ConfirmationResult;
  readonly currentUser = signal<User | null>(null);

  constructor(private auth: Auth, private router: Router) {
    this.auth.onAuthStateChanged(user => this.currentUser.set(user));
  }

  async sendOtp(phone: string, recaptchaVerifier: RecaptchaVerifier): Promise<void> {
    this.confirmationResult = await signInWithPhoneNumber(this.auth, phone, recaptchaVerifier);
  }

  async verifyOtp(code: string): Promise<void> {
    if (!this.confirmationResult) throw new Error('No OTP sent');
    await this.confirmationResult.confirm(code);
    await this.router.navigate(['/']);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigate(['/auth/login']);
  }

  async getIdToken(): Promise<string | null> {
    return this.auth.currentUser?.getIdToken() ?? null;
  }
}
