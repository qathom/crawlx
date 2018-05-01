import Store from 'electron-store';
const PREFERENCES = 'preferences';

export const storeConfig = {
  defaults: {
    preferences: {
      reseller: 'Amazon',
      // add several sites by default
      sites: [
        { url: 'https://amazon.co.uk', hostName: 'amazon.co.uk', isoCountry: 'UK' },
        { url: 'https://amazon.de', hostName: 'amazon.de', isoCountry: 'DE' },
        { url: 'https://amazon.fr', hostName: 'amazon.fr', isoCountry: 'FR' },
        { url: 'https://amazon.es', hostName: 'amazon.es', isoCountry: 'ES' },
        { url: 'https://amazon.it', hostName: 'amazon.it', isoCountry: 'IT' },
      ],
      expandSideBar: true,
      showScanLabel: true,
    },
  },
};

const store = new Store(storeConfig);

export function setPreference(preferenceName, value) {
  store.set(`${PREFERENCES}.${preferenceName}`, value);
  return true;
}

export function getPreference(preferenceName, defaultValue = null) {
  const value = store.get(PREFERENCES)[preferenceName];

  if (typeof value !== 'undefined') {
    return value;
  }

  return defaultValue;
}
