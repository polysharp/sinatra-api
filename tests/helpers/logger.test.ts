import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import fs from "fs";

import { Logger } from "@/helpers/logger";

const testLogsDir = "./tests/logs";

beforeAll(() => {
  if (!fs.existsSync(testLogsDir)) {
    fs.mkdirSync(testLogsDir);
  }
});

afterAll(() => {
  if (fs.existsSync(testLogsDir)) {
    fs.rmSync(testLogsDir, { recursive: true, force: true });
  }
});

describe("Logger", () => {
  it("should create log files in the test directory", () => {
    const logger = new Logger("test", testLogsDir);

    logger.info("Test info log", { key: "value" });

    const allLogExists = fs.existsSync(`${testLogsDir}/all.log`);
    const errorLogExists = fs.existsSync(`${testLogsDir}/error.log`);

    expect(allLogExists).toBe(true);
    expect(errorLogExists).toBe(true);
  });

  it("should redact sensitive fields in production", () => {
    const logger = new Logger("production", testLogsDir);

    logger.info("Sensitive data", {
      email: "user@example.com",
      password: "123",
    });

    const logContents = fs.readFileSync(`${testLogsDir}/all.log`, "utf-8");
    expect(logContents).not.toContain("user@example.com");
    expect(logContents).not.toContain("123");
  });
});
