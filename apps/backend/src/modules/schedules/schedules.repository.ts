import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { ISchedule } from '@smartschedule/shared';

@Injectable()
export class SchedulesRepository {
  private readonly collection = 'schedules';

  constructor(private readonly firebase: FirebaseService) {}

  async findById(id: string): Promise<ISchedule | null> {
    const doc = await this.firebase.firestore.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ISchedule;
  }

  async findByDate(date: string): Promise<ISchedule[]> {
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('date', '==', date)
      .orderBy('startTime')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ISchedule));
  }

  async findByMonth(year: number, month: number): Promise<ISchedule[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date')
      .orderBy('startTime')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ISchedule));
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ISchedule[]> {
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date')
      .orderBy('startTime')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ISchedule));
  }

  async create(data: Omit<ISchedule, 'id'>): Promise<ISchedule> {
    const ref = await this.firebase.firestore.collection(this.collection).add(data);
    return { id: ref.id, ...data };
  }

  async update(id: string, data: Partial<ISchedule>): Promise<void> {
    await this.firebase.firestore
      .collection(this.collection)
      .doc(id)
      .update({ ...data, updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<void> {
    await this.firebase.firestore.collection(this.collection).doc(id).delete();
  }
}
