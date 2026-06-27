import { projectsDatabaseDefinition } from "./modules/projects/index.js";
import { createDatabase } from "./sync/index.js";

async function main(): Promise<void> {
  console.log("Creating Projects database in Notion...");

  const result = await createDatabase(projectsDatabaseDefinition);

  console.log("Projects database created successfully.");
  console.log(`  Name:    ${result.name}`);
  console.log(`  ID:      ${result.id}`);
  console.log(`  URL:     ${result.url}`);
  console.log(`  Created: ${result.createdTime}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to create Projects database: ${message}`);
  process.exitCode = 1;
});
