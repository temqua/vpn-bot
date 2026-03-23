import { Payment, User } from '@prisma/client';

export type VPNUser = User & {
  payer: User | null;
  payments: Payment[];
  dependants: User[];
};
