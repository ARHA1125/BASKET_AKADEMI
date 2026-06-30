const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  try {
    console.log('Launching browser via Playwright...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Source HTML is in the workspace root
    const htmlPath = path.resolve(__dirname, '../../documentation.html');
    // Target PDF is in the workspace root
    const pdfPath = path.resolve(__dirname, '../../documentation.pdf');

    console.log(`Loading HTML source: ${htmlPath}`);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

    console.log(`Compiling and writing PDF to: ${pdfPath}`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: false
    });

    console.log('PDF generated successfully!');
    await browser.close();
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  }
})();
