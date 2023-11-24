import { UserInterface } from '../database/models/user.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import { AccessTokenInfo } from './models/access-token-info.js'

export class DestinyService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
     * Retrieves the list of definitions of Destiny items for a specified manifest file
     */
  async getDestinyInventoryItemDefinition (): Promise<any> {
    const manifest = await this.destinyApiClient.getDestinyInventoryItemDefinition()

    return manifest.data.DestinyInventoryItemDefinition
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  async getAccessToken (refreshToken: string): Promise<AccessTokenInfo> {
    const { data } = await this.destinyApiClient.getAccessTokenInfo(refreshToken)

    return new AccessTokenInfo(
      data.membership_id,
      data.refresh_expires_in,
      data.refresh_token,
      data.access_token
    )
  }

  /**
     * Retrieves the list of vendors and their inventory
     */
  async getDestinyVendorInfo (user: UserInterface, accessToken: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      accessToken
    )

    return data.Response.sales.data
  }

  /**
     * Retrieves the list of collectibles that exist in Destiny
     */
  async getDestinyCollectibleInfo (destinyId: string): Promise<any> {
    const { data } = await this.destinyApiClient.getDestinyCollectibleInfo(destinyId)

    return data.Response.profileCollectibles.data.collectibles
  }
}
