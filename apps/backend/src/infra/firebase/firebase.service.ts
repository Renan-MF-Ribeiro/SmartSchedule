import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      this.logger.log(`Firebase initialized for project: ${projectId}`);
    } else {
      this.app = admin.app();
    }
  }

  get firestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  get messaging(): admin.messaging.Messaging {
    return admin.messaging();
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }
}
