import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { IAvailability } from '@smartschedule/shared';

@Injectable()
export class AvailabilityRepository {
  private readonly collection = 'availability';

  constructor(private readonly firebase: FirebaseService) {}

  async findByUserId(userId: string): Promise<IAvailability | null> {
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IAvailability;
  }

  async upsert(userId: string, data: Omit<IAvailability, 'id' | 'userId'>): Promise<IAvailability> {
    const existing = await this.findByUserId(userId);
    const payload = { ...data, userId, updatedAt: new Date().toISOString() };
    if (existing) {
      await this.firebase.firestore
        .collection(this.collection)
        .doc(existing.id)
        .update(payload);
      return { id: existing.id, ...payload };
    }
    const ref = await this.firebase.firestore.collection(this.collection).add(payload);
    return { id: ref.id, ...payload };
  }
}
