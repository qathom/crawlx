import puppeteer from 'puppeteer';
import log from 'electron-log';

export default async function () {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const localChromiums = await browserFetcher.localRevisions();

  if (localChromiums.length === 0) {
    log.warn('no local chromium found.');
    return null;
  }

  const { executablePath } = await browserFetcher.revisionInfo(localChromiums[0]);

  return {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
    timeout: 60000,
    slowMo: 100,
    executablePath,
  };
}
