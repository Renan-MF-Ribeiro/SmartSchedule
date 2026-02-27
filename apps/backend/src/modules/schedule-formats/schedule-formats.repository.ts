import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../infra/firebase/firebase.service';
import { IScheduleFormat, DayOfWeek } from '@smartschedule/shared';

@Injectable()
export class ScheduleFormatsRepository {
  private readonly collection = 'scheduleFormats';

  constructor(private readonly firebase: FirebaseService) {}

  async findByDayOfWeek(dayOfWeek: DayOfWeek): Promise<IScheduleFormat | null> {
    const snapshot = await this.firebase.firestore
      .collection(this.collection)
      .where('dayOfWeek', '==', dayOfWeek)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IScheduleFormat;
  }

  async findAll(): Promise<IScheduleFormat[]> {
    const snapshot = await this.firebase.firestore.collection(this.collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IScheduleFormat));
  }

  async upsert(createdBy: string, data: Omit<IScheduleFormat, 'id' | 'createdBy' | 'updatedAt'>): Promise<IScheduleFormat> {
    const existing = await this.findByDayOfWeek(data.dayOfWeek);
    const payload = { ...data, createdBy, updatedAt: new Date().toISOString() };
    if (existing) {
      await this.firebase.firestore.collection(this.collection).doc(existing.id).update(payload);
      return { id: existing.id, ...payload };
    }
    const ref = await this.firebase.firestore.collection(this.collection).add(payload);
    return { id: ref.id, ...payload };
  }
}
