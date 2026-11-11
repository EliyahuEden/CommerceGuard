import { test as base, expect } from "@playwright/test"
import { env, loadSeed, type Seed } from "../config.js"
import { StoreClient } from "../api/store-client.js"
import { Database } from "../db/database.js"

type Fixtures = { store: StoreClient; seed: Seed; db: Database }
export const test = base.extend<Fixtures>({
  seed: async ({}, use) => {
    await use(loadSeed())
  },
  store: async ({ playwright, seed }, use) => {
    const context = await playwright.request.newContext({
      baseURL: env.API_URL,
      timeout: 30_000,
      // Keep business checks independent of stale HTTP/1.1 idle sockets in the
      // local development server. k6 separately exercises default keep-alive.
      extraHTTPHeaders: { connection: "close" },
    })
    await use(new StoreClient(context, seed))
    await context.dispose()
  },
  db: async ({}, use) => {
    const database = new Database()
    await use(database)
    await database.close()
  },
})
export { expect }
