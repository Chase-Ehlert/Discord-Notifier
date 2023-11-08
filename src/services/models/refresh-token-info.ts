export class RefreshTokenInfo {
  constructor (
    public readonly bungieMembershipId: string,
    public readonly refreshTokenExpirationTime: string,
    public readonly refreshToken: string
  ) {}
}
