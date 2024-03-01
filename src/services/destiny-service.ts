import { UserInterface } from '../database/models/user.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import { Collectible } from './models/collectible.js'

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
     * Retrieves the list of vendors and their inventory
     */
  async getVendorInfo (user: UserInterface): Promise<any> {
    const { data } = await this.destinyApiClient.getVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )

    return data.Response.sales.data
  }

  /**
     * Retrieves the list of unowned mods for a user
     */
  async getUnownedMods (destinyId: string): Promise<String[]> {
    const unownedModStateId = 65
    const { data } = await this.destinyApiClient.getCollectibleInfo(destinyId)
    const collectibleData = data.Response.profileCollectibles.data.collectibles
    const collectibles = Object.entries(collectibleData).map(([id, value]: [string, {state: number}]) => new Collectible(id, value.state))
    const collectibleMods = collectibles.filter(mod => mod.state === unownedModStateId)

    return collectibleMods.map(collectible => collectible.id)
  }
}
