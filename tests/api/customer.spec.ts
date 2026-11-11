import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { address } from "../../src/data/factories.js"

test("API-020 R-AUTH customer registration and login establish the correct identity @smoke", async ({
  store,
}) => {
  const user = await store.customer()
  const { customer } = await jsonOk<{
    customer: { id: string; email: string }
  }>(await user.client.get("/store/customers/me"))
  expect(customer).toMatchObject({ id: user.id, email: user.email })
})
test("API-021 R-AUTH wrong password returns 401", async ({ store }) => {
  const user = await store.customer()
  const response = await store.post("/auth/customer/emailpass", {
    email: user.email,
    password: "definitely-wrong",
  })
  expect(response.status()).toBe(401)
  expect(await response.json()).not.toHaveProperty("token")
})
test("API-022 R-AUTH duplicate registration cannot create another identity", async ({
  store,
}) => {
  const user = await store.customer()
  const response = await store.post("/auth/customer/emailpass/register", {
    email: user.email,
    password: user.password,
  })
  expect(response.status()).toBe(401)
  expect(await response.json()).not.toHaveProperty("token")
})
test("API-023 R-ACCESS anonymous customer access is denied @smoke", async ({
  store,
}) => {
  expect((await store.get("/store/customers/me")).status()).toBe(401)
})
test("API-024 R-ACCESS forged token cannot read customer data", async ({
  store,
}) => {
  const response = await store.request.get("/store/customers/me", {
    headers: { ...store.headers, authorization: "Bearer forged.token.value" },
  })
  expect(response.status()).toBe(401)
})
test("API-025 R-ACCOUNT profile updates persist for that customer only", async ({
  store,
}) => {
  const a = await store.customer()
  const b = await store.customer()
  await jsonOk(
    await a.client.post("/store/customers/me", {
      first_name: "Updated",
      phone: "+4511111111",
    }),
  )
  const updated = await jsonOk<{
    customer: { first_name: string; phone: string }
  }>(await a.client.get("/store/customers/me"))
  const other = await jsonOk<typeof updated>(
    await b.client.get("/store/customers/me"),
  )
  expect(updated.customer).toMatchObject({
    first_name: "Updated",
    phone: "+4511111111",
  })
  expect(other.customer.first_name).toBe("Commerce")
})
test("API-026 R-ACCESS another customer cannot delete an owned address", async ({
  store,
}) => {
  const a = await store.customer()
  const b = await store.customer()
  const created = await jsonOk<{ customer: { addresses: { id: string }[] } }>(
    await a.client.post("/store/customers/me/addresses", address()),
  )
  const id = created.customer.addresses[0].id
  expect(
    (await b.client.delete(`/store/customers/me/addresses/${id}`)).status(),
  ).toBe(404)
  const retained = await jsonOk<typeof created>(
    await a.client.get("/store/customers/me?fields=*addresses"),
  )
  expect(retained.customer.addresses.map((value) => value.id)).toContain(id)
})
test("API-027 R-ACCESS customer token cannot use admin product endpoints", async ({
  store,
}) => {
  const user = await store.customer()
  expect((await user.client.get("/admin/products")).status()).toBe(401)
})
