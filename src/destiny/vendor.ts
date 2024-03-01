import logger from '../utility/logger.js'
import { ManifestService } from '../services/manifest-service.js'
import { DestinyService } from '../services/destiny-service.js'
import { UserInterface } from '../database/models/user.js'
import { Mod } from '../services/models/mod.js'

export class Vendor {
  constructor (
    private readonly destinyService: DestinyService,
    private readonly manifestService: ManifestService
  ) { }

  /**
   * Collect mods for sale by Ada-1 that are not owned by the user
   */
  async getUnownedModsForSaleByAda (user: UserInterface): Promise<string[]> {
    try {
      const unownedMods = await this.destinyService.getUnownedMods(user.destinyId)
      const modsForSaleByAda = await this.getModsForSaleByAda(user)
      const unownedModsForSaleByAda = modsForSaleByAda.filter(mod => !unownedMods.includes(mod.itemHash))

      return unownedModsForSaleByAda.map(mod => mod.displayPropertyName)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving the collectibles for sale from Ada')
    }
  }

  /**
   * Collect mods for sale by Ada
   */
  private async getModsForSaleByAda (user: UserInterface): Promise<Mod[]> {
    let adaMerchandise
    const adaVendorId = '350061650'

    try {
      const vendorMerchandise = await this.destinyService.getVendorInfo(user)

      for (const vendorId in vendorMerchandise) {
        if (vendorId === adaVendorId) {
          adaMerchandise = vendorMerchandise[vendorId].saleItems
        }
      }

      const adaMerchandiseItemHashes: Mod[] = Object.values(adaMerchandise).map((item: Mod) => (new Mod(item.itemHash)))

      return await this.manifestService.getModInfoFromManifest(adaMerchandiseItemHashes)
    } catch (error) {
      logger.error(error)
      throw new Error('Problem with retreiving vendor mod inventory')
    }
  }
}
