import dns from "dns/promises";

import { createId } from "./custom-cuid2";

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

export function generateDnsKey(): string {
    return `sinatra-verification=${createId(16)}`;
}
