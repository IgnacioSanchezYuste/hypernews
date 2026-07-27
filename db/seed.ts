import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { pool } from "../src/lib/db";
import { allArticles } from "../src/lib/articles";

const BCRYPT_COST = 12;

async function main() {
  // Shares the app's pool so TLS, timeouts and limits are identical in production.
  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);

  for (const a of allArticles) {
    await pool.query(
      `insert into articles
        (slug, title, excerpt, image_url, image_alt, image_credit, cover_seed, category, tags, author,
         published_at, updated_at, blocks, featured, trending, series, views, comments)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       on conflict (slug) do nothing`,
      [
        a.slug,
        a.title,
        a.excerpt,
        a.image.url,
        a.image.alt,
        a.image.credit ?? null,
        a.coverSeed,
        a.category,
        a.tags,
        a.author,
        a.publishedAt,
        a.updatedAt ?? null,
        JSON.stringify(a.blocks),
        a.featured ?? false,
        a.trending ?? false,
        a.series ?? null,
        a.views,
        a.comments ?? 0,
      ]
    );
  }
  console.log(`Seeded ${allArticles.length} articles.`);

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) {
      console.error("ADMIN_PASSWORD es demasiado corta. Usa al menos 12 caracteres.");
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    await pool.query(
      `insert into admin_users (email, password_hash, name)
       values ($1, $2, $3)
       on conflict (email) do update set password_hash = excluded.password_hash`,
      [email.toLowerCase(), passwordHash, "Administrador"]
    );
    console.log(`Admin user ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user creation.");
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
