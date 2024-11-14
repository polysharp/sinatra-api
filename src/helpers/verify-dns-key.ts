import dns from "dns/promises";

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
