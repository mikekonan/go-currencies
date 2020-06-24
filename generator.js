const request = require("sync-request");
const htmlParser = require("node-html-parser");

let resp = request("GET", "https://www.iban.com/currency-codes");

let currencies = htmlParser
  .parse(resp.getBody("utf-8"))
  .querySelector("div.flat-row.pad-top20px.pad-bottom70px")
  .querySelector("div")
  .querySelector("div")
  .querySelector("div")
  .querySelector("div")
  .querySelector("table")
  .querySelector("tbody")
  .querySelectorAll("tr")
  .map((row) => {
    return {
      country: row.childNodes[1].text.replace(/  +/g, " "),
      currency: row.childNodes[3].text.replace(/  +/g, " "),
      code: row.childNodes[5].text.replace(/  +/g, " "),
      number: row.childNodes[7].text.replace(/  +/g, " "),
    };
  });

let currenciesByCodeMap = {};
let currenciesByNumberMap = {};
let currenciesByCountryMap = {};
let currenciesByCurrencyMap = {};

currencies.forEach((c) => {
  if (!!!currenciesByCodeMap[c.code]) {
    currenciesByCodeMap[c.code] = {
      countries: [c.country],
      currency: c.currency,
      code: c.code,
      number: c.number,
    };

    return;
  }

  currenciesByCodeMap[c.code].countries.push(c.country);
});

currencies.forEach((c) => {
  if (!!!currenciesByNumberMap[c.number]) {
    currenciesByNumberMap[c.number] = {
      countries: [c.country],
      currency: c.currency,
      code: c.code,
      number: c.number,
    };

    return;
  }

  currenciesByNumberMap[c.number].countries.push(c.country);
});

currencies.forEach((c) => {
  if (!!!currenciesByCountryMap[c.country]) {
    currenciesByCountryMap[c.country] = {
      countries: currenciesByCodeMap[c.code].countries,
      currency: c.currency,
      code: c.code,
      number: c.number,
    };

    return;
  }
});

currencies.forEach((c) => {
  if (!!!currenciesByCurrencyMap[c.currency]) {
    currenciesByCurrencyMap[c.currency] = {
      countries: [c.country],
      currency: c.currency,
      code: c.code,
      number: c.number,
    };

    return;
  }

  currenciesByCurrencyMap[c.currency].countries.push(c.country);
});

let render = (currenciesMap) => {
  return Object.keys(currenciesMap).map(
    (key) => `\`${key}\`: {
      countries:  []string{${currenciesMap[key].countries
        .map((country) => `\`${country}\``)
        .join(", ")}},
      currency:   \`${currenciesMap[key].currency}\`,
      code:       \`${currenciesMap[key].code}\`,
      number:     \`${currenciesMap[key].number}\`,
    }`
  ).join(`,
    `);
};

let template = `package currency

type currency struct {
	countries  []string
	currency   string
	code       string
	number     string
}

func (c currency) Currency() string { return c.currency }
func (c currency) Code() string     { return c.code }
func (c currency) Number() string   { return c.number }
func (c currency) Countries() []string  { return c.countries }

var currenciesByCode = map[string]currency{
    ${render(currenciesByCodeMap)},
}

var currenciesByNumber = map[string]currency{
  ${render(currenciesByNumberMap)},
}

var currenciesByCountry = map[string]currency{
  ${render(currenciesByCountryMap)},
}

var currenciesByCurrency = map[string]currency{
  ${render(currenciesByCurrencyMap)},
}

func ByCode(code string) currency {
	return currenciesByCode[code]
}

func ByCurrency(currency string) currency {
	return currenciesByCurrency[currency]
}

func ByNumber(number string) currency {
	return currenciesByNumber[number]
}

func ByCountry(number string) currency {
	return currenciesByCountry[number]
}
`;

console.log(template);
