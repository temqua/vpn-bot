import { $Enums, Payment, User } from '@prisma/client';

export type VPNUser = User & {
  payer: User | null;
  payments: Payment[];
  dependants: User[];
};

export type UserOrderParams = {
  by: 'username' | 'firstName';
  direction: 'asc' | 'desc';
};

export type UserExportRow = {
  id: number;
  username: string;
  telegramId: string | null;
  telegramLink: string | null;
  createdAt: Date;
  firstName: string | null;
  lastName: string | null;
  price: number;
  free: boolean;
  active: boolean;
  rwLink: string | null;
  rwId: number | null;
  devices: $Enums.Device[];
};
