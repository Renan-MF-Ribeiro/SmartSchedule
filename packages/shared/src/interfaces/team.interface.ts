export interface ITeam {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  adminId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
