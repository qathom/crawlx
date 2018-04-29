import Store from 'electron-store';
const PREFERENCES = 'preferences';

export const storeConfig = {
  defaults: {
    preferences: {
      reseller: 'Amazon',
      sites: [],
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
