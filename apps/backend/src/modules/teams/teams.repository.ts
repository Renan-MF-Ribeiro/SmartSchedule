import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { ITeam } from '@smartschedule/shared';

@Injectable()
export class TeamsRepository {
  private readonly collection = 'teams';

  constructor(private readonly firebase: FirebaseService) {}

  async findById(id: string): Promise<ITeam | null> {
    const doc = await this.firebase.firestore.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ITeam;
  }

  async findAll(): Promise<ITeam[]> {
    const snapshot = await this.firebase.firestore.collection(this.collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ITeam));
  }

  async create(data: Omit<ITeam, 'id'>): Promise<ITeam> {
    const ref = await this.firebase.firestore.collection(this.collection).add(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, data: Partial<ITeam>): Promise<void> {
    await this.firebase.firestore
      .collection(this.collection)
      .doc(id)
      .update({ ...data, updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<void> {
    await this.firebase.firestore.collection(this.collection).doc(id).delete();
  }
}
