import logger from '../utility/logger.js'
import { UserRepository } from './user-repository.js'
import { User } from './models/user.js'

export class MongoUserRepository implements UserRepository {
  /**
     * Updates the database information for a specific user using their Bungie membership id
     */
  async updateUserByMembershipId (
    bungieMembershipId: string,
    refreshExpirationTime: string,
    refreshToken: string
  ): Promise<void> {
    const filter = { bungieMembershipId: bungieMembershipId }
    const updatedUser = new User({
      refreshExpiration: this.determineExpirationDate(refreshExpirationTime),
      refreshToken: refreshToken
    },
    { _id: false }
    )

    try {
      await User.findOneAndUpdate(filter, updatedUser)
    } catch (error) {
      logger.error(error)
      throw new Error(`The record for ${bungieMembershipId}, could not be updated`)
    }
  }

  public determineExpirationDate (refreshExpirationTime: string): string {
    const daysTillTokenExpires = Number(refreshExpirationTime) / 60 / 60 / 24
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysTillTokenExpires)

    return expirationDate.toISOString().split('.')[0] + 'Z'
  }
}
