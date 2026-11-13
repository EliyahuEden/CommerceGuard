"use server"
import { retrieveCart, updateCart } from "./cart"
import { redirect } from "next/navigation"
export type AddressResult = {
  error: string
  fields: Record<string, string>
} | null
export async function submitCheckoutAddress(
  _previous: AddressResult,
  form: FormData,
): Promise<AddressResult> {
  const fields: Record<string, string> = {}
  const text = (name: string) => String(form.get(name) || "").trim()
  const same = text("same_as_billing") === "on"
  const address = (prefix: string) => {
    for (const field of [
      "first_name",
      "last_name",
      "address_1",
      "postal_code",
      "city",
      "country_code",
    ]) {
      if (!text(`${prefix}.${field}`))
        fields[`${prefix}.${field}`] = "This field is required."
    }
    return Object.fromEntries(
      [
        "first_name",
        "last_name",
        "address_1",
        "company",
        "postal_code",
        "city",
        "country_code",
        "province",
        "phone",
      ].map((field) => [field, text(`${prefix}.${field}`)]),
    )
  }
  const shipping = address("shipping_address")
  const billing = same ? shipping : address("billing_address")
  const email = text("email")
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fields.email = "Enter a valid email address."
  if (Object.keys(fields).length)
    return { error: "Please correct the highlighted fields.", fields }
  try {
    const cart = await retrieveCart()
    if (!cart)
      return {
        error: "Your bag could not be found. Return to your bag and try again.",
        fields: {},
      }
    const countries =
      cart.region?.countries?.map((country) => country.iso_2) || []
    if (
      !countries.includes(shipping.country_code) ||
      !countries.includes(billing.country_code)
    )
      return {
        error: "Choose a country supported by your bag's region.",
        fields: {
          "shipping_address.country_code": "Choose a supported country.",
        },
      }
    await updateCart({
      shipping_address: shipping,
      billing_address: billing,
      email,
    })
  } catch {
    return {
      error:
        "We could not save your address. Your details are still here. Please try again.",
      fields: {},
    }
  }
  redirect(`/${shipping.country_code}/checkout?step=delivery`)
}
