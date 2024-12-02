import dns from "dns/promises";

import { createId } from "./custom-cuid2";

/**
 * Verifies if a given DNS key exists in the TXT records of a specified domain.
 * @param domain - The domain to check the TXT records for.
 * @param key - The DNS key to verify. If null, the function will return false.
 * @returns A promise that resolves to a boolean indicating whether the key was found in the TXT records.
 */
export async function verifyDnsKey(
  domain: string,
  key: string | null,
): Promise<boolean> {
  try {
    let verified = false;
    if (!key) {
      return verified;
    }

    const records = await dns.resolveTxt(domain);

    records.forEach((record) => {
      if (record.includes(key)) {
        verified = true;
      }
    });

    return verified;
  } catch (e) {
    return false;
  }
}

/**
 * Generates a DNS key for Sinatra verification.
 * The generated key is a string in the format `sinatra-verification=<random_id>`,
 * where `<random_id>` is a cuid2 string of 16 characters.
 * @returns {string} The generated DNS key.
 */
export function generateDnsKey(): string {
  return `sinatra-verification=${createId(16)}`;
}
