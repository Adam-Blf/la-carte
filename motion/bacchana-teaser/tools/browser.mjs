// Lance Chromium via Playwright (paquet local ou global, binaire système si
// PLAYWRIGHT_CHROMIUM est défini).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    const require = createRequire(path.join(globalRoot, 'noop.js'));
    return require('playwright');
  }
}

export async function launch() {
  const { chromium } = await loadPlaywright();
  const exe = process.env.PLAYWRIGHT_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  return chromium.launch({
    executablePath: exe,
    args: ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb', '--disable-gpu-vsync', '--hide-scrollbars'],
  });
}
