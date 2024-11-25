import crypto from "crypto";

import config from "@/config";

export const encrypt = (string: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    config.API_KEY_CIPHER_SECRET,
    iv,
  );
  let encrypted = cipher.update(string, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedString: string) => {
  const [ivHex, encryptedData] = encryptedString.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    config.API_KEY_CIPHER_SECRET,
    iv,
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
