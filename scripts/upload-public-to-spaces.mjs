#!/usr/bin/env node
/*
  Upload all files under public/ to DigitalOcean Spaces (S3-compatible).
  Uses env vars compatible with existing app:
    - VITE_APP_AWS_BUCKET_NAME or DO_SPACES_BUCKET
    - VITE_APP_AWS_REGION or DO_SPACES_REGION (e.g. blr1)
    - VITE_APP_AWS_ACCESS_KEY_ID or DO_SPACES_KEY
    - VITE_APP_AWS_SECRET_ACCESS_KEY or DO_SPACES_SECRET

  Usage:
    node scripts/upload-public-to-spaces.mjs [--prefix path/in/bucket] [--dry-run]
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');

function getEnv(nameA, nameB) {
  return process.env[nameA] || process.env[nameB] || '';
}

const bucket = getEnv('VITE_APP_AWS_BUCKET_NAME', 'DO_SPACES_BUCKET');
const region = getEnv('VITE_APP_AWS_REGION', 'DO_SPACES_REGION');
const accessKeyId = getEnv('VITE_APP_AWS_ACCESS_KEY_ID', 'DO_SPACES_KEY');
const secretAccessKey = getEnv('VITE_APP_AWS_SECRET_ACCESS_KEY', 'DO_SPACES_SECRET');

if (!bucket || !region || !accessKeyId || !secretAccessKey) {
  console.error('Missing DigitalOcean Spaces env configuration.');
  console.error('Required: bucket, region, accessKeyId, secretAccessKey');
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const prefixArgIdx = args.indexOf('--prefix');
const prefix = prefixArgIdx !== -1 ? (args[prefixArgIdx + 1] || '') : '';

const s3 = new S3Client({
  region: 'blr1', // Force correct region
  endpoint: `https://${bucket}.blr1.digitaloceanspaces.com`,
  forcePathStyle: false,
  credentials: { accessKeyId, secretAccessKey },
});

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(res));
    else results.push(res);
  }
  return results;
}

function shouldCacheAggressively(relPath) {
  if (/(\.[a-f0-9]{8,}\.)/.test(relPath)) return true;
  const ext = path.extname(relPath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'].includes(ext);
}

async function headObjectIfExists(Key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key }));
    return true;
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404) return false;
    return false;
  }
}

async function uploadFile(absPath) {
  const rel = path.relative(publicDir, absPath).replace(/\\/g, '/');
  const Key = prefix ? `${prefix.replace(/\/$/, '')}/${rel}` : rel;
  const contentType = mime.lookup(rel) || 'application/octet-stream';
  const body = fs.readFileSync(absPath);

  if (dryRun) {
    console.log(`[dry-run] PUT s3://${bucket}/${Key} (${contentType})`);
    return;
  }

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: shouldCacheAggressively(rel) ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
  }));
  const cdn = process.env.DO_SPACES_CDN_BASE || `https://${bucket}.blr1.digitaloceanspaces.com`;
  console.log(`Uploaded: ${Key} -> ${cdn}/${Key}`);
}

async function main() {
  if (!fs.existsSync(publicDir)) {
    console.error(`public directory not found at ${publicDir}`);
    process.exit(1);
  }
  const files = walk(publicDir);
  if (files.length === 0) {
    console.log('No files in public/ to upload.');
    return;
  }
  console.log(`Found ${files.length} files. Uploading to bucket "${bucket}" in region "${region}" with prefix "${prefix}"${dryRun ? ' (dry-run)' : ''}.`);

  let success = 0;
  let failed = 0;
  for (const filePath of files) {
    try {
      await uploadFile(filePath);
      success++;
    } catch (e) {
      failed++;
      console.error(`Failed: ${filePath}`, e?.message || e);
    }
  }
  console.log(`Done. Uploaded: ${success}, Failed: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


