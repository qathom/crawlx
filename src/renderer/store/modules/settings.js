import { getISOCountry, getHostName } from '@/utils';
import { storeConfig, setPreference, getPreference } from '@/preferences';
import puppeteer from 'puppeteer';
import log from 'electron-log';
import browserConfig from '@/browser';

const state = {};
const getters = {};

Object.keys(storeConfig.defaults.preferences).forEach((key) => {
  state[key] = getPreference(key, storeConfig.defaults.preferences[key]);
  getters[key] = state => state[key];
});

const mutations = {
  EDIT_RESELLER(state, reseller = null) {
    state.reseller = reseller;
    setPreference('reseller', state.reseller);
  },
  ADD_SITE(state, site = {}) {
    state.sites.push(site);
    setPreference('sites', state.sites);
  },
  REMOVE_SITE(state, url) {
    const index = state.sites.findIndex(site => site.url === url);

    if (index > -1) {
      state.sites.splice(index, 1);
      setPreference('sites', state.sites);
    }
  },
  SET_STATE_SIDE_BAR(state, expand) {
    state.expandSideBar = expand;
    setPreference('expandSideBar', expand);
  },
  SET_SHOW_SCAN_LABEL(state, show) {
    state.showScanLabel = show;
    setPreference('showScanLabel', show);
  },
};

const actions = {
  editReseller({ commit }, reseller = null) {
    commit('EDIT_RESELLER', reseller);
  },
  addSite({ commit }, url = '') {
    log.info('add site');
    return new Promise(async (resolve, reject) => {
      if (browserConfig === null) {
        reject(new Error('Unknown executable path to launch the browser'));
        return;
      }

      log.info(`trying to launch browser with executable path: ${browserConfig.executablePath}`);

      puppeteer.launch(browserConfig).then(async (browser) => {
        log.info('creating browser instance');

        const page = await browser.newPage();
        await page.goto(url, {
          waitUntil: ['networkidle2'],
        });

        log.info('find info on home page');

        const elTitle = await page.$('input[name="field-keywords"]');
        const elCountry = await page.$('#icp-touch-link-country .icp-color-base');

        const urlValid = elTitle !== null;

        if (!urlValid) {
          throw new Error('Invalid site');
        }

        const hostName = getHostName(url);
        const domainExtension = hostName.match(/\.([a-z]{1,2}\.?[a-z]{1,2})/)[1];

        let countryText = getISOCountry(domainExtension, true);

        // if the country is display
        if (elCountry) {
          // convert United States to US etc.
          countryText = getISOCountry(await page.evaluate(
            el => el.innerHTML,
            await elCountry.asElement(),
          ), false);
        }

        const newSite = {
          url,
          hostName,
          isoCountry: countryText,
        };

        log.info('add site in settings');

        commit('ADD_SITE', newSite);

        await browser.close();

        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  },
  removeSite({ commit }, url = '') {
    commit('REMOVE_SITE', url);
  },
  setExpandSidebar({ commit }, expand = true) {
    commit('SET_STATE_SIDE_BAR', expand);
  },
  setShowScanLabel({ commit }, show = true) {
    commit('SET_SHOW_SCAN_LABEL', show);
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
