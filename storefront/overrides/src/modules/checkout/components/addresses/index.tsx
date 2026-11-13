"use client"
import { useActionState, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { submitCheckoutAddress } from "@lib/data/checkout-address"
import { SubmitButton } from "../submit-button"

const names = [
  "first_name",
  "last_name",
  "address_1",
  "company",
  "postal_code",
  "city",
  "country_code",
  "province",
  "phone",
] as const
const labels: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  address_1: "Address",
  company: "Company",
  postal_code: "Postal code",
  city: "City",
  country_code: "Country",
  province: "State / Province",
  phone: "Phone",
}
const testNames: Record<string, string> = {
  first_name: "first-name",
  last_name: "last-name",
  address_1: "address",
  company: "company",
  postal_code: "postal-code",
  city: "city",
  country_code: "country",
  province: "province",
  phone: "phone",
}
const autocomplete: Record<string, string> = {
  first_name: "given-name",
  last_name: "family-name",
  address_1: "address-line1",
  company: "organization",
  postal_code: "postal-code",
  city: "address-level2",
  country_code: "country",
  province: "address-level1",
  phone: "tel",
}
const required = [
  "first_name",
  "last_name",
  "address_1",
  "postal_code",
  "city",
  "country_code",
]

export default function Addresses({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const open = params.get("step") === "address"
  const [same, setSame] = useState(true)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      email: cart?.email || customer?.email || "",
    }
    for (const prefix of ["shipping_address", "billing_address"] as const)
      for (const name of names)
        initial[`${prefix}.${name}`] = String(cart?.[prefix]?.[name] || "")
    return initial
  })
  const [result, action] = useActionState(submitCheckoutAddress, null)
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})
  const alert = useRef<HTMLDivElement>(null)
  const errors = { ...result?.fields, ...clientErrors }
  useEffect(() => {
    if (result?.error) alert.current?.focus()
  }, [result])
  const change = (name: string, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }))
    setClientErrors((previous) => ({ ...previous, [name]: "" }))
  }
  const field = (
    name: string,
    label: string,
    testId: string,
    section: string,
    isRequired = false,
  ) => (
    <div className="forme-field" key={name}>
      <label htmlFor={name}>
        {label}
        {isRequired ? " *" : " (optional)"}
      </label>
      {name.endsWith("country_code") ? (
        <select
          id={name}
          name={name}
          value={values[name]}
          onChange={(event) => change(name, event.target.value)}
          required={isRequired}
          autoComplete={`${section} country`}
          data-testid={testId}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        >
          <option value="">Select country</option>
          {cart?.region?.countries?.map((country) => (
            <option key={country.iso_2} value={country.iso_2}>
              {country.display_name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          value={values[name]}
          onChange={(event) => change(name, event.target.value)}
          type={
            name === "email" ? "email" : name.endsWith("phone") ? "tel" : "text"
          }
          autoComplete={
            name === "email"
              ? "email"
              : `${section} ${autocomplete[name.split(".")[1]]}`
          }
          required={isRequired}
          data-testid={testId}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        />
      )}
      {errors[name] && (
        <span id={`${name}-error`} className="forme-field-error">
          {errors[name]}
        </span>
      )}
    </div>
  )
  const addressFields = (prefix: "shipping_address" | "billing_address") =>
    names
      .filter((name) => name !== "phone")
      .map((name) =>
        field(
          `${prefix}.${name}`,
          labels[name],
          `${prefix === "shipping_address" ? "shipping" : "billing"}-${testNames[name]}-${name === "country_code" ? "select" : "input"}`,
          prefix === "shipping_address" ? "shipping" : "billing",
          required.includes(name),
        ),
      )
  return (
    <section
      className="forme-address-section"
      aria-labelledby="shipping-heading"
    >
      <div className="forme-checkout-section-heading">
        <h2 id="shipping-heading">Shipping Address</h2>
        {!open && cart?.shipping_address && (
          <button
            type="button"
            onClick={() => router.push(pathname + "?step=address")}
            data-testid="edit-address-button"
          >
            Edit
          </button>
        )}
      </div>
      {open ? (
        <form
          action={action}
          noValidate
          onSubmit={(event) => {
            const invalid: Record<string, string> = {}
            const prefixes = same
              ? ["shipping_address"]
              : ["shipping_address", "billing_address"]
            for (const prefix of prefixes)
              for (const name of required)
                if (!values[`${prefix}.${name}`]?.trim())
                  invalid[`${prefix}.${name}`] = "This field is required."
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
              invalid.email = "Enter a valid email address."
            setClientErrors(invalid)
            if (Object.keys(invalid).length) {
              event.preventDefault()
              const first = event.currentTarget.elements.namedItem(
                Object.keys(invalid)[0],
              )
              if (first instanceof HTMLElement) first.focus()
            }
          }}
        >
          {(Object.values(clientErrors).some(Boolean) || result?.error) && (
            <div
              role="alert"
              tabIndex={-1}
              ref={alert}
              className="forme-form-error"
              data-testid="address-error-message"
            >
              {Object.values(clientErrors).some(Boolean)
                ? "Please correct the highlighted fields. Your details have been kept."
                : result?.error}
            </div>
          )}
          <div className="forme-address-grid">
            {addressFields("shipping_address")}
          </div>
          <label className="forme-checkbox">
            <input
              name="same_as_billing"
              type="checkbox"
              checked={same}
              onChange={(event) => setSame(event.target.checked)}
              data-testid="billing-address-checkbox"
            />
            Billing address same as shipping address
          </label>
          {!same && (
            <fieldset>
              <legend>Billing address</legend>
              <div className="forme-address-grid">
                {addressFields("billing_address")}
              </div>
            </fieldset>
          )}
          <div className="forme-address-grid">
            {field("email", "Email", "shipping-email-input", "shipping", true)}
            {field(
              "shipping_address.phone",
              "Phone",
              "shipping-phone-input",
              "shipping",
            )}
          </div>
          <SubmitButton className="mt-6" data-testid="submit-address-button">
            Continue to delivery
          </SubmitButton>
        </form>
      ) : (
        <div
          className="forme-address-summary"
          data-testid="shipping-address-summary"
        >
          <p>
            {cart?.shipping_address?.first_name}{" "}
            {cart?.shipping_address?.last_name}
          </p>
          <p>{cart?.shipping_address?.address_1}</p>
          <p>
            {cart?.shipping_address?.postal_code} {cart?.shipping_address?.city}
          </p>
          <p>{cart?.email}</p>
        </div>
      )}
    </section>
  )
}
