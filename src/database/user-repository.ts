export interface UserRepository {
  updateUserByMembershipId: (
    bungieMembershipId: string,
    refreshExpirationTime: string,
    refreshToken: string
  ) => Promise<void>
}
