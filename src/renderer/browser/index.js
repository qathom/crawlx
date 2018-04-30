import puppeteer from 'puppeteer';
import log from 'electron-log';

export default async function () {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const localChromiums = await browserFetcher.localRevisions();

  if (localChromiums.length === 0) {
    log.warn('no local chromium found.');
    return 'usr/bin/chromium';
  }

  const { executablePath } = await browserFetcher.revisionInfo(localChromiums[0]);

  return executablePath;
}
