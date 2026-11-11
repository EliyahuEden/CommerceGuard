import { randomUUID } from "node:crypto"

export function customerData() {
  return {
    email: `cg.${randomUUID()}@example.test`,
    password: `Cg!${randomUUID()}9`,
    first_name: "Commerce",
    last_name: "Guard",
  }
}
export const address = () => ({
  first_name: "Commerce",
  last_name: "Guard",
  address_1: "Test Street 42",
  city: "Copenhagen",
  country_code: "dk",
  postal_code: "2100",
  phone: "+4512345678",
})
