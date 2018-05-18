import puppeteer from 'puppeteer';

// executable path must be outside the asar package
const executablePath = puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');

export default {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
  timeout: 60000,
  slowMo: 100,
  executablePath,
};

