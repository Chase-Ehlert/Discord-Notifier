import { DestinyApiClient } from './destiny-api-client'
import { UserInterface } from '../database/models/user'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG } from '../config/config'
import { MongoUserRepository } from '../database/mongo-user-repository'

jest.mock('./../utility/logger', () => {
  return {
    error: jest.fn()
  }
})

describe('<DestinyApiClient/>', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const config = DESTINY_API_CLIENT_CONFIG
  const mongoUserRepository = new MongoUserRepository()
  const destinyApiClient = new DestinyApiClient(axiosHttpClient, mongoUserRepository, config)

  it('should retrieve a list of definitions for Destiny items from a specific manifest file', async () => {
    const expectedManifestFileName = 'manifest'
    const manifest = {
      data: {
        Response: {
          jsonWorldContentPaths: {
            en: expectedManifestFileName
          }
        }
      }
    }
    const itemDefinition = {
      data: {
        DestinyInventoryItemDefinition: {
          item1: 'definition'
        }
      }
    }
    axiosHttpClient.get = jest.fn().mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return Promise.resolve(itemDefinition)
      }
    })

    const value = await destinyApiClient.getDestinyInventoryItemDefinition()

    expect(axiosHttpClient.get).toHaveBeenCalledWith('https://www.bungie.net/manifest')
    expect(axiosHttpClient.get).toHaveBeenCalledWith(`https://www.bungie.net/${expectedManifestFileName}`)
    expect(value).toEqual(itemDefinition.data.DestinyInventoryItemDefinition)
  })

  it('should catch an error in getDestinyInventoryItemDefinition if one occurs when making the first http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getDestinyInventoryItemDefinition()).rejects.toThrow(Error)
  })

  it('should catch an error in getDestinyInventoryItemDefinition if one occurs when making the second http call', async () => {
    const expectedManifestFileName = 'manifest'
    const manifest = {
      data: {
        Response: {
          jsonWorldContentPaths: {
            en: expectedManifestFileName
          }
        }
      }
    }

    axiosHttpClient.get = jest.fn().mockImplementation(async (url): Promise<any> => {
      switch (url) {
        case 'https://www.bungie.net/platform/destiny2/manifest/':
          return Promise.resolve(manifest)
        case `https://www.bungie.net/${expectedManifestFileName}`:
          return Promise.reject(Error)
      }
    })

    await expect(async () => destinyApiClient.getDestinyInventoryItemDefinition()).rejects.toThrow(Error)
  })

  it('should retrieve the list of Destiny vendors and their inventory', async () => {
    const destinyId = 'destinyId'
    const destinyCharacterId = 'character'
    const accessToken = '123'
    const expectedMembershipId = '123'
    const expectedRefreshExpiration = '456'
    const expectedRefreshToken = '789'
    const user = {
      bungieUsername: 'name',
      bungieUsernameCode: 'code',
      discordId: 'discordId',
      discordChannelId: 'channelId',
      bungieMembershipId: 'bungie',
      destinyId: destinyId,
      destinyCharacterId: destinyCharacterId,
      refreshExpiration: 'expiration',
      refreshToken: 'token'
    } as unknown as UserInterface
    const result = {
      data: {
        Response: { sales: { data: { vendor: 'info' } } }
      }
    }
    const response = {
      data: {
        membership_id: expectedMembershipId,
        refresh_expires_in: expectedRefreshExpiration,
        refresh_token: expectedRefreshToken,
        access_token: accessToken
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)
    axiosHttpClient.post = jest.fn().mockResolvedValue(response)
    jest.spyOn(mongoUserRepository, 'updateUserByMembershipId').mockResolvedValue()

    const value = await destinyApiClient.getVendorInfo(user.destinyId, user.destinyCharacterId, accessToken)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${user.destinyId}/Character/${user.destinyCharacterId}/Vendors/`,
      {
        params: {
          components: 402
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyVendorInfo if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getVendorInfo('1', '2', '3')).rejects.toThrow(Error)
  })

  it('should retrieve the list of collectibles that exist in Destiny', async () => {
    const destinyId = 'destinyId'
    const result = {
      data: {
        Response: { profileCollectibles: { data: { collectibles: { item1: 'name' } } } }
      }
    }
    axiosHttpClient.get = jest.fn().mockResolvedValue(result)

    const value = await destinyApiClient.getCollectibleInfo(destinyId)

    expect(axiosHttpClient.get).toHaveBeenCalledWith(
      `https://www.bungie.net/platform/destiny2/3/profile/${destinyId}/`,
      {
        params: {
          components: 800
        },
        headers: {
          'x-api-key': config.apiKey
        }
      }
    )
    expect(value).toEqual(result)
  })

  it('should catch an error in getDestinyCollectibleInfo if one occurs when making a http call', async () => {
    axiosHttpClient.get = jest.fn().mockRejectedValue(Error)

    await expect(async () => destinyApiClient.getCollectibleInfo('1')).rejects.toThrow(Error)
  })
})
