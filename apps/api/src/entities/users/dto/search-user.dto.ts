export class SearchUserDto {
  username?: string;
  telegramId?: string;
  firstName?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
