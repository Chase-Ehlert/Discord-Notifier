import { DestinyService } from './destiny-service.js'
import { Mod } from './models/mod.js'

export class ManifestService {
  constructor (private readonly destinyService: DestinyService) { }

  /**
   * Collect info (name and hashId) of mods from the manifest
   */
  async getModInfoFromManifest (itemHashes: Mod[]): Promise<Mod[]> {
    const destinyInventoryModDescriptions = await this.getDestinyInventoryModDescriptions()
    const unownedMods = itemHashes.filter(item => destinyInventoryModDescriptions.has(item.itemHash))
    const unownedModInfo = unownedMods.map(item => {
      const modName = destinyInventoryModDescriptions.get(item.itemHash)
      if (modName !== undefined) {
        return new Mod(item.itemHash, modName)
      }
    })
    const legitmateUnownedModInfo = unownedModInfo.filter((item): item is Mod => item !== undefined)

    return legitmateUnownedModInfo
  }

  private async getDestinyInventoryModDescriptions (): Promise<Map<string, string>> {
    const destinyInventoryItemDefinition = await this.destinyService.getDestinyInventoryItemDefinition()
    const filteredInventory = Object.values(destinyInventoryItemDefinition).filter((item: Partial<Mod>) => {
      return (JSON.stringify(item.itemType) === '19') &&
      (Boolean(Object.prototype.hasOwnProperty.call(item, 'hash')))
    })
    const destinyInventoryMods: Mod[] = Object.values(filteredInventory).map((
      { displayProperties, itemType, hash }: any
    ) => (
      new Mod(hash, displayProperties.name, itemType)
    ))

    const modsWithDetails = new Map(destinyInventoryMods.map(mod => [mod.itemHash, mod.displayPropertyName]))

    return modsWithDetails
  }
}
