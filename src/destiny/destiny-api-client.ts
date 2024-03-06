import logger from '../utility/logger.js'
import { HttpClient } from '../utility/http-client.js'
import { DestinyApiClientConfig } from './config/destiny-api-client-config.js'
import { UserInterface } from '../database/models/user.js'
import { UserRepository } from '../database/user-repository.js'
import { TokenInfo } from '../services/models/token-info.js'

export class DestinyApiClient {
  private readonly apiKeyHeader
  private readonly urlEncodedHeaders
  private readonly bungieDomain = 'https://www.bungie.net/'
  private readonly bungieDomainWithTokenDirectory = 'https://www.bungie.net/platform/app/oauth/token/'
  private readonly bungieDomainWithDestinyDirectory = 'https://www.bungie.net/platform/destiny2/'
  private readonly profileDirectory = '3/profile/'

  constructor (
    private readonly httpClient: HttpClient,
    private readonly database: UserRepository,
    private readonly config: DestinyApiClientConfig
  ) {
    this.apiKeyHeader = { 'x-api-key': this.config.apiKey }
    this.urlEncodedHeaders = {
      'content-type': 'application/x-www-form-urlencoded',
      'x-api-key': this.config.apiKey
    }
  }

  async getDestinyInventoryItemDefinition (): Promise<any> {
    try {
      const { data } = await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + 'manifest/', {
          headers: this.apiKeyHeader
        })
      const manifestFileName: string = data.Response.jsonWorldContentPaths.en

      try {
        const response = await this.httpClient.get(this.bungieDomain + manifestFileName)
        return response.data.DestinyInventoryItemDefinition
      } catch (error) {
        logger.error(error)
        throw new Error('Could not retreive Destiny inventory item definition')
      }
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny manifest file name')
    }
  }

  async getVendorInfo (destinyId: string, destinyCharacterId: string, refreshToken: string): Promise<any> {
    const getVendorSalesComponent = 402
    const tokenInfo = await this.getAccessToken(refreshToken)

    await this.database.updateUserByMembershipId(
      tokenInfo.bungieMembershipId,
      tokenInfo.refreshTokenExpirationTime,
      tokenInfo.refreshToken
    )

    try {
      return await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory +
        this.profileDirectory +
        `${destinyId}/Character/${destinyCharacterId}/Vendors/`, {
          params: {
            components: getVendorSalesComponent
          },
          headers: {
            Authorization: `Bearer ${tokenInfo.accessToken}`,
            'x-api-key': this.config.apiKey
          }
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny vendor information')
    }
  }

  async getCollectibleInfo (destinyId: string): Promise<any> {
    const getCollectiblesComponent = 800

    try {
      return await this.httpClient.get(
        this.bungieDomainWithDestinyDirectory + this.profileDirectory + `${destinyId}/`, {
          params: {
            components: getCollectiblesComponent
          },
          headers: this.apiKeyHeader
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive Destiny collectible information')
    }
  }

  /**
   * Check the token expiration date and update it if it's expired
   */
  async checkRefreshTokenExpiration (user: UserInterface): Promise<void> {
    const currentDate = new Date()
    const expirationDate = new Date(String(user.refreshExpiration))
    expirationDate.setDate(expirationDate.getDate() - 1)

    if (currentDate.getTime() > expirationDate.getTime()) {
      const tokenInfo = await this.getAccessToken(
        user.refreshToken
      )
      await this.database.updateUserByMembershipId(
        tokenInfo.bungieMembershipId,
        tokenInfo.refreshTokenExpirationTime,
        tokenInfo.refreshToken
      )
    }
  }

  /**
     * Retrieve the user's access token by calling the Destiny API with their refresh token
     */
  private async getAccessToken (refreshToken: string): Promise<TokenInfo> {
    const { data } = await this.getAccessTokenInfo(refreshToken)

    return new TokenInfo(
      data.membership_id,
      data.refresh_expires_in,
      data.refresh_token,
      data.access_token
    )
  }

  private async getAccessTokenInfo (refreshToken: string): Promise<any> {
    try {
      return await this.httpClient.post(
        this.bungieDomainWithTokenDirectory, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.oauthClientId,
          client_secret: this.config.oauthSecret
        }, {
          headers: this.urlEncodedHeaders
        })
    } catch (error) {
      logger.error(error)
      throw new Error('Could not retreive access token information')
    }
  }
}
