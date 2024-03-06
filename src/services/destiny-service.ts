import { UserInterface } from '../database/models/user.js'
import { DestinyApiClient } from '../destiny/destiny-api-client.js'
import { Collectible } from './models/collectible.js'
import { Mod } from './models/mod.js'

export class DestinyService {
  constructor (private readonly destinyApiClient: DestinyApiClient) { }

  /**
     * Retrieves the merchandise sold by Ada
     */
  async getAdaMerchandise (user: UserInterface): Promise<Mod[]> {
    let adaMerchandise
    const adaVendorId = '350061650'
    const { data } = await this.destinyApiClient.getVendorInfo(
      user.destinyId,
      user.destinyCharacterId,
      user.refreshToken
    )

    for (const vendorId in data.Response.sales.data) {
      if (vendorId === adaVendorId) {
        adaMerchandise = data.Response.sales.data[vendorId].saleItems
      }
    }

    return Object.values(adaMerchandise).map((item: Mod) => (new Mod(item.itemHash)))
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
