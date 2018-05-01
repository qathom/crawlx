/* eslint-disable import/prefer-default-export */
const currencies = {
  USD: '$', // US Dollar
  EUR: '€', // Euro
  GBP: '£', // British Pound Sterling
  INR: '₹', // Indian Rupee
  JPY: '¥', // Japanese Yen
  KRW: '₩', // South Korean Won
  UAH: '₴', // Ukrainian Hryvnia
  VND: '₫', // Vietnamese Dong
};

export function getHostName(url = '') {
  const parser = document.createElement('a');
  parser.href = url;

  return parser.hostname;
}

// input: United States or .us
// output: US
export function getISOCountry(country, domainExtension = false) {
  if (!country) {
    return '';
  }

  const countryName = country.trim().toUpperCase();

  if (domainExtension) {
    const withDot = countryName.lastIndexOf('.');

    if (withDot > -1) {
      return countryName.substring(withDot + 1, countryName.length);
    }

    return countryName;
  }

  if (countryName.indexOf(' ') > -1) {
    return countryName.split(' ').map(word => word[0]).toString().replace(/,/g, '');
  }

  return (countryName[0] + countryName[1]);
}

export function parsePrice(price = '') {
  // use cases
  // EUR 49.99
  // 60,99€

  if (typeof price === 'number') {
    return price;
  }

  if (typeof price !== 'string') {
    return 0;
  }

  return parseFloat(price.trim()
    .replace('€', '')
    .replace('EUR', '')
    .replace('£', '')
    .replace('GBP', '')
    .replace(',', '.'));
}

export function getCurrency(price = '') {
  return Object.keys(currencies)
    .find(name => price.indexOf(name) > -1 || price.indexOf(currencies[name]) > -1);
}
