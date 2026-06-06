export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: string,
    public plan: 'BASIC' | 'PREMIUM' = 'BASIC',
    public authProvider: 'LOCAL' | 'GOOGLE' = 'LOCAL',
    public passwordResetCode?: string | null,
    public passwordResetExpiresAt?: Date | null,
    public createdAt: Date = new Date()
  ) { }
}