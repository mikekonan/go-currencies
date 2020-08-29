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
      countries:  []Country{${currenciesMap[key].countries
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

import "fmt"

type Country string

func (c Country) Validate(_ interface{}) error {
	if _, ok := ByCountry(string(c)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 country", c)
	}

	return nil
}

func (c Country) IsSet() bool {
	return len(string(c)) > 0
}

type Currency string

func (c Currency) Validate(_ interface{}) error {
	if _, ok := ByCurrency(string(c)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 currency", c)
	}

	return nil
}

func (c Currency) IsSet() bool {
	return len(string(c)) > 0
}

type Code string

func (c Code) Validate(_ interface{}) error {
	if _, ok := ByCode(string(c)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 code", c)
	}

	return nil
}

func (c Code) IsSet() bool {
	return len(string(c)) > 0
}

type Number string

func (n Number) Validate(_ interface{}) error {
	if _, ok := ByNumber(string(n)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 number", n)
	}

	return nil
}

func (n Number) IsSet() bool {
	return len(string(n)) > 0
}

type currency struct {
	countries []Country
	currency  Currency
	code      Code
	number    Number
}

func (c currency) Currency() Currency   { return c.currency }
func (c currency) Code() Code           { return c.code }
func (c currency) Number() Number       { return c.number }
func (c currency) Countries() []Country { return c.countries }

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

func ByCode(code string) (c currency, ok bool) {
	c, ok = currenciesByCode[code]
	return
}

func ByCurrency(currency string) (c currency, ok bool) {
	c, ok = currenciesByCurrency[currency]
	return
}

func ByNumber(number string) (c currency, ok bool) {
	c, ok = currenciesByNumber[number]
	return
}

func ByCountry(number string) (c currency, ok bool) {
	c, ok = currenciesByCountry[number]
	return
}
`;

console.log(template);
