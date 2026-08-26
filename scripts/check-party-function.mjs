#!/usr/bin/env node
/**
 * Probes the deployed `party-inquiry` Edge Function (OPTIONS preflight).
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
)
  .trim()
  .replace(/\/$/, '');

console.log('Party inquiry Edge Function check\n');

if (!url) {
  console.error('❌ No Supabase URL in .env.');
  process.exit(1);
}

const fnUrl = `${url}/functions/v1/party-inquiry`;
console.log('Probing OPTIONS:', fnUrl);

let res;
try {
  res = await fetch(fnUrl, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://4sq-app.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,apikey,content-type,x-client-info',
    },
  });
} catch (e) {
  console.error('❌ Network error:', e.message);
  process.exit(1);
}

console.log('HTTP status:', res.status);

if (res.status === 404) {
  console.error('\n❌ 404 — deploy with: npm run deploy:party-inquiry');
  process.exit(1);
}

if (res.status === 401 || res.status === 403) {
  console.error('\n❌ JWT verification is ON — deploy with --no-verify-jwt');
  process.exit(1);
}

if (res.status >= 200 && res.status < 300) {
  console.log('\n✅ Preflight OK');
  process.exit(0);
}

console.error('\n❌ Unexpected status');
process.exit(1);
