import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../../infra/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebase: FirebaseService) {}

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.firebase.auth.verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
