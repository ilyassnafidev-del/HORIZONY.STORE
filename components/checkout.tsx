"use client";
import { useState } from "react";
import Link from "next/link";
import { LockKeyhole, Check, ArrowRight } from "lucide-react";
import { BagContents, useStore } from "./store";
import { deliveryInformation } from "@/lib/config";
type Values = Record<string, string>;
const fields = [
  ["firstName", "First name", "given-name"],
  ["lastName", "Last name", "family-name"],
  ["email", "Email address", "email"],
  ["phone", "Phone number", "tel"],
  ["street", "Street address", "address-line1"],
  ["unit", "Apartment, suite or unit (optional)", "address-line2"],
  ["city", "City", "address-level2"],
  ["region", "State / province / region", "address-level1"],
  ["postal", "Postal code", "postal-code"],
];
const countries = [
  ["FR", "France"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["DE", "Germany"],
  ["ES", "Spain"],
  ["IT", "Italy"],
  ["NL", "Netherlands"],
  ["BE", "Belgium"],
  ["CH", "Switzerland"],
  ["AU", "Australia"],
  ["IE", "Ireland"],
  ["AE", "United Arab Emirates"],
  ["HK", "Hong Kong"],
  ["SG", "Singapore"],
  ["JP", "Japan"],
];
const noPostal = ["AE", "HK"];
export function validateField(key: string, value: string, v: Values) {
  const val = value.trim();
  if (key === "unit") return "";
  if (key === "country" && !val) return "Choose a country.";
  if (key === "postal" && noPostal.includes(v.country)) return "";
  if (!val)
    return `${key === "country" ? "Choose a country" : (fields.find((f) => f[0] === key)?.[1] ?? "This field")} is required.`;
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
    return "Enter a valid email address.";
  if (
    key === "phone" &&
    (!/^[+\d\s().-]+$/.test(val) ||
      val.replace(/\D/g, "").length < 7 ||
      val.replace(/\D/g, "").length > 15)
  )
    return "Enter a phone number with 7–15 digits.";
  if (key === "postal") {
    const patterns: Record<string, RegExp> = {
      FR: /^\d{5}$/,
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i,
      GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
      DE: /^\d{5}$/,
      ES: /^\d{5}$/,
      IT: /^\d{5}$/,
      NL: /^\d{4}\s?[A-Z]{2}$/i,
      BE: /^\d{4}$/,
      CH: /^\d{4}$/,
      AU: /^\d{4}$/,
      IE: /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i,
      SG: /^\d{6}$/,
      JP: /^\d{3}-?\d{4}$/,
    };
    if (patterns[v.country] && !patterns[v.country].test(val))
      return "Enter a valid postal code for your selected country.";
  }
  if (val.length > 200) return "Use 200 characters or fewer.";
  return "";
}
export function Checkout() {
  const { lines, ready } = useStore();
  const [values, setValues] = useState<Values>({ country: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const keys = ["country", ...fields.map((f) => f[0])];
  const errors = Object.fromEntries(
    keys.map((key) => [key, validateField(key, values[key] ?? "", values)]),
  );
  const update = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setChecked(false);
  };
  const checkDetails = () => {
    setTouched(Object.fromEntries(keys.map((key) => [key, true])));
    if (!Object.values(errors).some(Boolean)) setChecked(true);
    else document.getElementById(keys.find((key) => errors[key])!)?.focus();
  };
  if (ready && !lines.length)
    return (
      <section className="section cart-page">
        <h1>A considered beginning.</h1>
        <p>
          Your bag is empty. Choose a piece to explore the checkout preview.
        </p>
        <Link className="button dark" href="/shop">
          EXPLORE THE COLLECTION <ArrowRight size={18} />
        </Link>
      </section>
    );
  return (
    <section className="section checkout-page">
      <span className="eyebrow">CHECKOUT / PREVIEW</span>
      <h1>One step closer.</h1>
      <div className="checkout-notice">
        <LockKeyhole size={19} />
        <div>
          <strong>Checkout is not yet live.</strong>
          <p>
            This form previews the future experience. Details stay in this
            page’s memory and are never submitted or saved. No orders can be
            placed.
          </p>
        </div>
      </div>
      <div className="checkout-grid">
        <div className="checkout-form" role="form" aria-label="Checkout preview">
          <div className="checkout-step">
            <span>01</span>
            <h2>Your details.</h2>
          </div>
          <div className="form-grid">
            {fields.slice(0, 4).map(([key, label, autocomplete]) => (
              <label key={key}>
                {label}
                <input
                  id={key}
                  name={key}
                  type={
                    key === "email" ? "email" : key === "phone" ? "tel" : "text"
                  }
                  autoComplete={autocomplete}
                  required
                  maxLength={200}
                  value={values[key] ?? ""}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
                  aria-invalid={!!(touched[key] && errors[key])}
                  aria-describedby={`${key}-error`}
                />
                <span id={`${key}-error`} className="field-error">
                  {touched[key] ? errors[key] : ""}
                </span>
              </label>
            ))}
          </div>
          <div className="checkout-step">
            <span>02</span>
            <h2>Delivery address.</h2>
          </div>
          <label>
            Country
            <select
              id="country"
              name="country"
              autoComplete="country"
              value={values.country}
              required
              onChange={(e) => update("country", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, country: true }))}
              aria-invalid={!!(touched.country && errors.country)}
              aria-describedby="country-error"
            >
              <option value="">Select country</option>
              {countries.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <span id="country-error" className="field-error">
              {touched.country ? errors.country : ""}
            </span>
          </label>
          <p className="note">
            Countries shown for form validation only. Delivery destinations are
            not yet confirmed.
          </p>
          <div className="form-grid">
            {fields.slice(4).map(([key, label, autocomplete]) => (
              <label
                className={["street", "unit"].includes(key) ? "full" : ""}
                key={key}
              >
                {key === "postal" && noPostal.includes(values.country)
                  ? "Postal code (optional for this country)"
                  : label}
                <input
                  id={key}
                  name={key}
                  autoComplete={autocomplete}
                  required={
                    key !== "unit" &&
                    !(key === "postal" && noPostal.includes(values.country))
                  }
                  maxLength={200}
                  value={values[key] ?? ""}
                  onChange={(e) => update(key, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
                  aria-invalid={!!(touched[key] && errors[key])}
                  aria-describedby={`${key}-error`}
                />
                <span id={`${key}-error`} className="field-error">
                  {touched[key] ? errors[key] : ""}
                </span>
              </label>
            ))}
          </div>
          <button type="button" className="button outline" onClick={checkDetails}>
            CHECK DETAILS <Check size={17} />
          </button>
          <p role="status" className="validation-status">
            {checked
              ? "Details validated for this preview. Nothing has been submitted."
              : ""}
          </p>
          <div className="checkout-step">
            <span>03</span>
            <h2>Payment.</h2>
          </div>
          <div className="payment-coming">
            <LockKeyhole />
            <h3>Secure card payments coming soon.</h3>
            <p>
              Debit and credit cards will be supported through a secure payment
              provider once order processing is configured.
            </p>
            <button type="button" className="button dark" disabled>
              PAYMENT UNAVAILABLE
            </button>
          </div>
          <nav className="policy-links checkout-policy-links" aria-label="Checkout policies">
            <Link href="/refund-policy">Refund & Cancellation Policy</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </nav>
        </div>
        <aside className="order-summary">
          <span className="eyebrow">YOUR SELECTION</span>
          <h2>Order summary.</h2>
          <BagContents summary />
          <dl>
            <div>
              <dt>Shipping cost</dt>
              <dd>Not configured</dd>
            </div>
            <div>
              <dt>Taxes</dt>
              <dd>Not configured</dd>
            </div>
            <div>
              <dt>Final total</dt>
              <dd>Awaiting delivery & tax setup</dd>
            </div>
          </dl>
          <p className="note">{deliveryInformation.processing}</p>
          <p className="note">{deliveryInformation.shipping}</p>
          <Link className="text-link" href="/shipping">Shipping Policy</Link>
          <Link className="text-link" href="/cart">
            Edit your bag
          </Link>
        </aside>
      </div>
    </section>
  );
}
