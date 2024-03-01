import { DiscordService } from './discord-service'
import { Vendor } from '../destiny/vendor'
import { DestinyService } from './destiny-service'
import { MongoUserRepository } from '../database/mongo-user-repository'
import { ManifestService } from './manifest-service'
import { DestinyApiClient } from '../destiny/destiny-api-client'
import { AxiosHttpClient } from '../utility/axios-http-client'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG } from '../config/config'

jest.mock('./../utility/url', () => {
  return 'example'
})

describe('<DiscordService/>', () => {
  const axiosHttpClient = new AxiosHttpClient()
  const config = DISCORD_CONFIG
  const destinyService = new DestinyService(
    new DestinyApiClient(new AxiosHttpClient(), DESTINY_API_CLIENT_CONFIG, new MongoUserRepository())
  )
  const vendor = new Vendor(
    destinyService,
    new ManifestService(destinyService)
  )
  const discordService = new DiscordService(vendor, axiosHttpClient, config)

  it('should instantiate', () => {
    expect(discordService).not.toBeNull()
  })
})
