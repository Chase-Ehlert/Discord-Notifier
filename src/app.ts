import express from 'express'
import logger from './utility/logger.js'
import { DiscordService } from './services/discord-service.js'
import { Vendor } from './destiny/vendor.js'
import { DestinyService } from './services/destiny-service.js'
import { AxiosHttpClient } from './utility/axios-http-client.js'
import { MongoUserRepository } from './database/mongo-user-repository.js'
import { DESTINY_API_CLIENT_CONFIG, DISCORD_CONFIG, MONGO_DB_SERVICE_CONFIG } from './config/config.js'
import { ManifestService } from './services/manifest-service.js'
import { DestinyApiClient } from './destiny/destiny-api-client.js'
import { MongoDbService } from './services/mongo-db-service.js'

const destinyApiClient = new DestinyApiClient(
  new AxiosHttpClient(),
  DESTINY_API_CLIENT_CONFIG,
  new MongoUserRepository()
)
const destinyService = new DestinyService(destinyApiClient)
const mongoDbService = new MongoDbService(MONGO_DB_SERVICE_CONFIG)
const discordService = new DiscordService(
  new Vendor(destinyService, new ManifestService(destinyService)),
  new AxiosHttpClient(),
  DISCORD_CONFIG
)

const app = express()
app.use(express.json())

app.listen(3002, () => {
  logger.info('Discord-Notifier is running...')
})

app.post('/notify', (async (request, result) => {
  await destinyApiClient.checkRefreshTokenExpiration(request.body.user)
  await discordService.compareModsForSaleWithUserInventory(request.body.user)
  result.status(200).send(String(request.body.user.bungieUsername) + ' notified')
}) as express.RequestHandler)

await mongoDbService.connectToDatabase()
