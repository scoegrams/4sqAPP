#!/usr/bin/env node
/**
 * Verifies Supabase is reachable using the same vars as the Vite app.
 * Run from repo root: npm run check:db
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const root = resolve(__dirname, '..');
const env = loadEnvFile(resolve(root, '.env'));
const url = (
  env.VITE_SUPABASE_URL ||
  env.SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const key =
  env.VITE_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

console.log('Supabase connection check (reads .env in project root)\n');

if (!url || !key) {
  console.error('❌ Missing Supabase URL + anon key in .env');
  console.error('   Use VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, or SUPABASE_URL + SUPABASE_ANON_KEY.');
  console.error('   Values: Supabase → Settings → API.');
  process.exit(1);
}

console.log('URL:', url);

// Auth service health (no DB schema required)
const healthUrl = `${url}/auth/v1/health`;
let res;
try {
  res = await fetch(healthUrl, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
} catch (e) {
  console.error('❌ Network error:', e.message);
  process.exit(1);
}

if (!res.ok) {
  const body = await res.text();
  console.error(`❌ Auth health failed: HTTP ${res.status}`);
  console.error(body.slice(0, 500));
  process.exit(1);
}

console.log('✅ Auth API reachable (health OK)');

// Optional: REST ping — fails if migrations not run yet (table missing)
const restUrl = `${url}/rest/v1/profiles?select=id&limit=1`;
const rest = await fetch(restUrl, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  },
});

if (rest.status === 200) {
  console.log('✅ REST API OK — `profiles` table exists (migrations likely applied)');
} else if (rest.status === 404 || rest.status === 406) {
  const t = await rest.text();
  console.warn('⚠️  REST:', rest.status, '- if you see PGRST205 / table not found, run SQL migrations in Supabase (see docs/DATABASE_SETUP.md)');
  if (t.length < 400) console.warn(t);
} else {
  const t = await rest.text();
  console.warn(`⚠️  REST returned ${rest.status} — check key permissions and project status`);
  if (t.length < 400) console.warn(t);
}

console.log('\nNext: apply migrations in Supabase SQL Editor if you have not yet (docs/DATABASE_SETUP.md).');
process.exit(0);
