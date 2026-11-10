import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import metadata from "libphonenumber-js/metadata.min.json";

/**
 * Phone number handling for the public forms. The API stores numbers in
 * international form with the country code and no spaces, for example
 * +2348034471063, so everything here ends in that shape whatever the
 * visitor types or pastes.
 */

export type { CountryCode };

export const DEFAULT_COUNTRY: CountryCode = "NG";

export type PhoneReading = {
  country: CountryCode;
  /** What the field shows: the number without its country code, spaced for reading. */
  display: string;
  /** What is sent to the API, such as "+2348034471063". Empty when nothing is typed. */
  e164: string;
  valid: boolean;
};

const callingCodes = (metadata as { country_calling_codes: Record<string, string[]> }).country_calling_codes;

/** The country a shared dialling code is best known for (+1 is the United States, +44 the United Kingdom). */
function mainCountryFor(callingCode: string): CountryCode | undefined {
  return callingCodes[callingCode]?.[0] as CountryCode | undefined;
}

export function dialCode(country: CountryCode) {
  return `+${getCountryCallingCode(country)}`;
}

/**
 * Tidies whatever was typed or pasted: "00234…" becomes "+234…", the "(0)"
 * in "+44 (0)20…" is dropped, and letters, spaces and punctuation go.
 */
function clean(raw: string) {
  let text = raw.replace(/\(0\)/g, "");
  // Skip any words in front of the number, as in "Tel: +234 803…".
  const start = text.search(/[+\d]/);
  text = start < 0 ? "" : text.slice(start);
  const international = /^(\+|00)/.test(text);
  text = text.replace(/\D/g, "");
  if (international) return `+${text.replace(/^00/, "")}`;
  return text;
}

/** The number without its country code, spaced the way it is read aloud: "803 447 1063". */
function nationalDisplay(nationalNumber: string, country: CountryCode) {
  if (!nationalNumber) return "";
  const dial = dialCode(country);
  const spaced = new AsYouType().input(`${dial}${nationalNumber}`);
  return spaced.startsWith(dial) ? spaced.slice(dial.length).trim() : nationalNumber;
}

/** Several countries can share one dialling code; settle on the most sensible one. */
function settleCountry(detected: CountryCode | undefined, callingCode: string, current: CountryCode) {
  // The number itself says which country it belongs to (+1 876… is Jamaica).
  if (detected) return detected;
  // Not enough digits to tell yet: keep the visitor's choice if it fits the code.
  if (getCountryCallingCode(current) === callingCode) return current;
  return mainCountryFor(callingCode) ?? current;
}

// The longest number the international standard allows, country code included.
const MAX_DIGITS = 15;

/**
 * Works out the country and number from raw input.
 *
 *   "0803 447 1063"       with Nigeria chosen   →  +2348034471063
 *   "2348034471063"       with Nigeria chosen   →  +2348034471063
 *   "+44 7911 123456"     with Nigeria chosen   →  United Kingdom, +447911123456
 *   "00 1 415 555 2671"                         →  United States, +14155552671
 */
export function readPhone(raw: string, current: CountryCode = DEFAULT_COUNTRY): PhoneReading {
  let text = clean(raw);
  if (!text || text === "+") {
    return { country: current, display: text, e164: "", valid: false };
  }

  if (text.startsWith("+")) {
    text = text.slice(0, MAX_DIGITS + 1);
    const typer = new AsYouType();
    typer.input(text);
    const callingCode = typer.getCallingCode();
    // The dialling code is not complete yet: show what was typed and wait.
    if (!callingCode) return { country: current, display: text, e164: "", valid: false };
    const national = typer.getNationalNumber();
    const country = settleCountry(typer.getCountry(), callingCode, current);
    return {
      country,
      display: nationalDisplay(national, country),
      e164: national ? `+${callingCode}${national}` : "",
      valid: typer.isValid(),
    };
  }

  // No plus sign: a number written the local way, for the chosen country.
  text = text.slice(0, MAX_DIGITS);
  const typer = new AsYouType(current);
  const typed = typer.input(text);
  const national = typer.getNationalNumber();
  const e164 = national ? (typer.getNumber()?.number ?? `${dialCode(current)}${national}`) : "";
  // Keep a leading 0 on screen while it is being typed; otherwise show the tidy form.
  const keepsPrefix = Boolean(national) && !typer.getCallingCode() && !text.startsWith(national);
  return {
    country: current,
    display: keepsPrefix || !national ? typed : nationalDisplay(national, current),
    e164,
    valid: typer.isValid(),
  };
}

/** Reads a stored number (for example "+2348034471063") back into the field. */
export function readStoredPhone(value: string, fallback: CountryCode = DEFAULT_COUNTRY): PhoneReading {
  return readPhone(value, fallback);
}

/** "+234 803 447 1063", for showing a number back to the visitor. */
export function formatInternational(e164: string) {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export function countryName(country: CountryCode) {
  if (country === "AC") return "Ascension Island";
  if (country === "TA") return "Tristan da Cunha";
  if (country === "XK") return "Kosovo";
  try {
    return regionNames?.of(country) ?? country;
  } catch {
    return country;
  }
}

export type CountryEntry = { code: CountryCode; name: string; dial: string };

let cachedCountries: CountryEntry[] | null = null;

/** Every country with a dialling code: Nigeria first, then alphabetical. */
export function listCountries(): CountryEntry[] {
  if (!cachedCountries) {
    cachedCountries = getCountries()
      .map((code) => ({ code, name: countryName(code), dial: dialCode(code) }))
      .sort((a, b) => (a.code === DEFAULT_COUNTRY ? -1 : b.code === DEFAULT_COUNTRY ? 1 : a.name.localeCompare(b.name)));
  }
  return cachedCountries;
}

/**
 * A message for a number that cannot be right, or undefined when it is fine.
 * An empty value is fine unless the field is required.
 */
export function phoneProblem(e164: string, options: { required?: boolean } = {}): string | undefined {
  const value = e164.trim();
  if (!value) return options.required ? "Enter your phone number." : undefined;
  const parsed = parsePhoneNumberFromString(value);
  if (parsed?.isValid()) return undefined;
  const where = parsed?.country ? ` for ${countryName(parsed.country)}` : "";
  const length = validatePhoneNumberLength(value);
  const tail = options.required ? "Check it and try again." : "Check it and try again, or leave it blank.";
  if (length === "TOO_SHORT") return `That number is too short${where}. ${tail}`;
  if (length === "TOO_LONG") return `That number is too long${where}. ${tail}`;
  return `That does not look like a phone number${where}. Check the country and the number.`;
}
