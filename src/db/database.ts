import pg from "pg"
import { env } from "../config.js"

export class Database {
  private readonly pool: pg.Pool
  constructor() {
    const url = new URL(env.DATABASE_URL)
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      url.pathname !== "/commerceguard_test"
    )
      throw new Error("DB assertions require local commerceguard_test")
    this.pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: 2,
      statement_timeout: 5000,
      options: "-c default_transaction_read_only=on",
    })
  }
  async rows<T extends pg.QueryResultRow>(sql: string, values: unknown[]) {
    return (await this.pool.query<T>(sql, values)).rows
  }
  close() {
    return this.pool.end()
  }
}
