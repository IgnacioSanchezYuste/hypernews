import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { runDailyNewsUpdate } from "../src/lib/auto-articles";

async function main() {
  const results = await runDailyNewsUpdate(10);
  for (const r of results) {
    if (r.error) {
      console.error(`[${r.category}] error: ${r.error}`);
    } else {
      console.log(`[${r.category}] insertados: ${r.inserted.join(", ") || "ninguno"} · omitidos (ya existían): ${r.skipped}`);
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
