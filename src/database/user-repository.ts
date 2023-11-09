import { UserInterface } from './models/user'

export interface UserRepository {
  updateUserByMembershipId: (
    bungieMembershipId: string,
    refreshExpirationTime: string,
    refreshToken: string
  ) => Promise<void>

  fetchAllUsers: () => Promise<UserInterface[]>
}
