export interface IUser {
  id: string;
  name: string;
  phone: string; // normalized E.164
  fcmTokens: string[];
  teamIds: string[];
  isAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
