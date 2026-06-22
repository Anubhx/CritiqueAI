import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    deviceScaleFactor: 2 // High resolution for editorial look
  });
  
  const fileUrl = `file://${path.resolve('asset-generator.html')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const assets = [
    { id: 'heuristic-review', filename: 'heuristic-review.png' },
    { id: 'accessibility-findings', filename: 'accessibility-findings.png' },
    { id: 'visual-hierarchy', filename: 'visual-hierarchy.png' },
    { id: 'recommendation-card', filename: 'recommendation-card.png' },
    { id: 'homepage-audit-screen', filename: 'homepage-audit-screen.png' },
  ];

  for (const asset of assets) {
    const locator = page.locator(`#${asset.id}`);
    await locator.screenshot({ path: path.join('public', 'audits', asset.filename) });
    console.log(`Saved ${asset.filename}`);
  }

  await browser.close();
})();
