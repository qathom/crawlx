import puppeteer from 'puppeteer';

export default {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
  timeout: 60000,
  slowMo: 100,
  executablePath: puppeteer.executablePath(),
};

