import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
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
