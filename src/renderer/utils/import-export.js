/* eslint no-console: 0 */

const rules = {
  id: String,
  title: String,
  price: Number,
  currency: String,
  rating: Number,
  rankings: Array,
  date: String,
  bestSeller: Boolean,
  reviews: Number,
  replies: Number,
  lostBuyBox: Boolean,
  buyBoxSeller: {
    name: String,
    link: String,
    price: Number,
    details: String,
  },
  site: String,
  link: String,
  images: Number,
  videos: Number,
  bulletPoints: Array,
  detailPage: Boolean,
};

const ARRAY_SEPARATOR = '//';

const strRules = Object.keys(rules).filter(r => rules[r] === String);
const boolRules = Object.keys(rules).filter(r => rules[r] === Boolean);
const arrRules = Object.keys(rules).filter(r => rules[r] === Array);
const numRules = Object.keys(rules).filter(r => rules[r] === Number);
const objRules = Object.keys(rules).filter(r => typeof rules[r] === 'object');

export function checkRows(rows = []) {
  let isValid = true;

  Object.keys(rules).every((rule) => {
    if (!isValid) {
      return false;
    }

    rows.every((row) => {
      if (typeof rules[rule] === 'object') {
        Object.keys(rules[rule]).every((key) => {
          if (typeof row[rule] === 'undefined' || typeof row[rule][key] === 'undefined') {
            console.error(`rule ${rule}.${key} is undefined`);
            isValid = false;
            return false;
          }

          return true;
        });

        return true;
      }

      if (typeof row[rule] === 'undefined') {
        console.error(`rule ${rule} is undefined`);
        isValid = false;
        return false;
      }

      if (row[rule].constructor !== rules[rule]) {
        console.error(`rule ${rule} is type of ${row[rule].constructor} instead of ${rules[rule]}`);
        isValid = false;
        return false;
      }

      return true;
    });

    return true;
  });

  return isValid;
}

export function exportRows(rows = []) {
  const outputRows = [];
  const rowsData = rows.slice();

  rowsData.forEach((row) => {
    const outputRow = {};

    // convert null strings in empty string
    strRules.forEach((rule) => {
      if (row[rule] === null || row[rule] === undefined) {
        outputRow[rule] = '';
      } else {
        outputRow[rule] = row[rule];
      }
    });

    // convert booleans in natural language
    boolRules.forEach((rule) => {
      outputRow[rule] = row[rule] ? 'Yes' : 'No';
    });

    // convert arrays comma separated
    arrRules.forEach((rule) => {
      outputRow[rule] = row[rule].join(ARRAY_SEPARATOR);
    });

    numRules.forEach((rule) => {
      outputRow[rule] = row[rule];
    });

    // convert objects
    objRules.forEach((rule) => {
      Object.keys(row[rule]).forEach((key) => {
        outputRow[`${rule}.${key}`] = row[rule][key];
      });
      delete row[rule];
    });

    outputRows.push(outputRow);
  });

  return outputRows;
}

export function importRows(rows = []) {
  const rowsData = rows.slice();

  rowsData.forEach((row) => {
    // convert null strings
    strRules.forEach((rule) => {
      if (row[rule] === '') {
        row[rule] = null;
      }
    });

    // convert booleans
    boolRules.forEach((rule) => {
      row[rule] = row[rule] === 'Yes';
    });

    // convert arrays
    arrRules.forEach((rule) => {
      row[rule] = row[rule] ? row[rule].split(ARRAY_SEPARATOR) : [];
    });

    // convert str (excel format) in number
    numRules.forEach((rule) => {
      row[rule] = parseFloat(row[rule]);
    });

    // convert object dot notation
    objRules.forEach((rule) => {
      row[rule] = {};
      Object.keys(rules[rule]).forEach((key) => {
        const dotKey = `${rule}.${key}`;
        row[rule][key] = row[dotKey];
        delete row[dotKey];
      });
    });
  });

  return rowsData;
}
