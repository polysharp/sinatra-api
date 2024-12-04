import db from "@/database/database";
import schemas from "@/database/schemas";
import { createId } from "@/helpers/custom-cuid2";
import { faker } from "@faker-js/faker";

async function seedAnalysesData(siteId: string, numberOfRecords: number) {
  const analyses = Array.from({ length: numberOfRecords }, () => ({
    id: createId(),
    siteId,
    performance: faker.number.int({ min: 0, max: 100 }),
    accessibility: faker.number.int({ min: 0, max: 100 }),
    bestPractices: faker.number.int({ min: 0, max: 100 }),
    seo: faker.number.int({ min: 0, max: 100 }),
    status: faker.helpers.arrayElement(["SUCCESS", "PENDING", "FAILED"]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));

  await db.insert(schemas.analysis).values(analyses);
  console.log(
    `Seeded ${numberOfRecords} analyses records for siteId: ${siteId}`,
  );
}

const args = Bun.argv.slice(2);

if (args.length < 2) {
  console.error(
    "Usage: bun run seeds/fake-analyses.ts <siteId> <numberOfRecords>",
  );
  process.exit(1);
}

const [siteId, numberOfRecordsStr] = args;
const numberOfRecords = parseInt(numberOfRecordsStr, 10);

if (isNaN(numberOfRecords) || numberOfRecords <= 0) {
  console.error("The number of records must be a positive integer.");
  process.exit(1);
}

try {
  await seedAnalysesData(siteId, numberOfRecords);
  console.log("Seeding completed successfully.");
} catch (err) {
  console.error("Error seeding analyses data:", err);
  process.exit(1);
}
