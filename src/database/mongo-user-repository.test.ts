import { User } from './models/user'
import { MongoUserRepository } from './mongo-user-repository'

jest.mock('./../utility/logger', () => {
  return {
    info: jest.fn(),
    error: jest.fn()
  }
})

describe('<MongoUserRepository/>', () => {
  const mongoUserRepo = new MongoUserRepository()

  it('should instantiate', () => {
    expect(mongoUserRepo).not.toBeNull()
  })

  it('should update a users record in the database by using their membership id', async () => {
    const bungieMembershipId = 'guardian'
    const refreshExpiration = '1000'
    const refreshToken = 'guardian#123'
    User.findOneAndUpdate = jest.fn().mockResolvedValue({})

    await mongoUserRepo.updateUserByMembershipId(bungieMembershipId, refreshExpiration, refreshToken)

    expect(User.findOneAndUpdate).toBeCalledWith(
      { bungieMembershipId: bungieMembershipId },
      expect.objectContaining(
        {
          refreshExpiration: mongoUserRepo.determineExpirationDate(refreshExpiration),
          refreshToken: refreshToken
        })
    )
  })

  it('should throw an error when a user record cant be updated by a membership id', async () => {
    const bungieUsername = 'guardian'
    User.findOneAndUpdate = jest.fn().mockRejectedValue(Error)

    await expect(
      async () => mongoUserRepo.updateUserByMembershipId(bungieUsername, '', '')
    ).rejects.toThrow(Error)

    await expect(
      async () => mongoUserRepo.updateUserByMembershipId(bungieUsername, '', '')
    ).rejects.toThrow(`The record for ${bungieUsername}, could not be updated`)
  })
})
