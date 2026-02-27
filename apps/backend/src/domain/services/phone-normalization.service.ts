import { Injectable } from '@nestjs/common';

@Injectable()
export class PhoneNormalizationService {
  /**
   * Normalizes a phone number to E.164 format
   * e.g. (11) 99999-9999 -> +5511999999999
   */
  normalize(phone: string, countryCode = '55'): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith(countryCode)) {
      return `+${digits}`;
    }
    return `+${countryCode}${digits}`;
  }

  isValid(phone: string): boolean {
    const e164Regex = /^\+[1-9]\d{7,14}$/;
    return e164Regex.test(phone);
  }
}
