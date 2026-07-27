import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { pool } from "../src/lib/db";
import { runDailyNewsUpdate } from "../src/lib/auto-articles";

const ITEMS_PER_CATEGORY = 30;
const MAX_AGE_DAYS = 30;

/** One-off: wipe every curated article and repopulate from scratch with a month of coverage. */
async function main() {
  const { rowCount } = await pool.query("delete from articles where source_url is not null");
  console.log(`Eliminadas ${rowCount} noticias curadas existentes.`);

  console.log(`Buscando hasta ${ITEMS_PER_CATEGORY} noticias por categoría de los últimos ${MAX_AGE_DAYS} días…`);
  const results = await runDailyNewsUpdate(ITEMS_PER_CATEGORY, MAX_AGE_DAYS);

  for (const r of results) {
    if (r.error) {
      console.error(`[${r.category}] error: ${r.error}`);
    } else {
      console.log(`[${r.category}] insertados: ${r.inserted.length} · omitidos (ya existían): ${r.skipped}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
