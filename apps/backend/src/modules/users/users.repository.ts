import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { IUser } from '@smartschedule/shared';
import { PhoneNormalizationService } from '../../domain/services/phone-normalization.service';

@Injectable()
export class UsersRepository {
  private readonly collection = 'users';

  constructor(
    private readonly firebase: FirebaseService,
    private readonly phoneNorm: PhoneNormalizationService,
  ) {}

  async findById(id: string): Promise<IUser | null> {
    const doc = await this.firebase.firestore.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as IUser;
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    const normalized = this.phoneNorm.normalize(phone);
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('phone', '==', normalized)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IUser;
  }

  async create(id: string, data: Omit<IUser, 'id'>): Promise<IUser> {
    await this.firebase.firestore.collection(this.collection).doc(id).set(data);
    return { id, ...data };
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    await this.firebase.firestore
      .collection(this.collection)
      .doc(id)
      .update({ ...data, updatedAt: new Date().toISOString() });
  }
}
