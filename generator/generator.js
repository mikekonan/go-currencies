const request = require('sync-request');
const xml2js = require('xml2js');

let resp = request('GET', 'https://www.currency-iso.org/dam/downloads/lists/list_one.xml');

if (resp.statusCode !== 200) {
    console.log(`unexpected status code - '${resp.statusCode}'`)
    os.exit(1)
}


let render = (currencies) => {
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
        if (!!currenciesByCountryMap[c.country]) {
            currenciesByCountryMap[c.country].currencies.push(c)
            return;
        }

        currenciesByCountryMap[c.country] = {
            currencies: [c],
        };

        return;
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

    let renderByCountry =
        (currenciesMap) => {
            return Object.keys(currenciesMap).map((key) => `\`${key}\`: {
                      ${currenciesMap[key].currencies.map(c => {
                return `{
                        countries:  Countries{${currenciesByCodeMap[c.code].countries.map((country) => `\`${country}\``).join(', ')}},
                        currency:   \`${c.currency}\`,
                        code:       \`${c.code}\`,
                        number:     \`${c.number}\`,
                        }`;
            }).join(`,`)},
                    }`).join(`,`)
        };

    let render =
        (currenciesMap) => {
            return Object.keys(currenciesMap)
                .map(
                    (key) => `\`${key}\`: {
      countries:  Countries{${
                        currenciesMap[key]
                            .countries.map((country) => `\`${country}\``)
                            .join(', ')}},
      currency:   \`${currenciesMap[key].currency}\`,
      code:       \`${currenciesMap[key].code}\`,
      number:     \`${currenciesMap[key].number}\`,
    }`).join(`,
    `)
        };

    let template = `// This code is auto-generated; DO NOT EDIT.
package currency

import (
	"database/sql/driver"
	"fmt"
)

type Country string

func (c Country) Value() (value driver.Value, err error) {
	if err = c.Validate(nil); err != nil {
		return nil, err
	}

	return c, nil
}

func (c Country) Validate(_ interface{}) error {
	if _, ok := ByCountry(string(c)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 country", c)
	}

	return nil
}

func (c Country) IsSet() bool {
	return len(string(c)) > 0
}

type Countries []Country

func (countries Countries) IsCountryIn(country string) bool {
	for _, c := range countries {
		if string(c) == country {
			return true
		}
	}

	return false
}

type Currency string

func (c Currency) Value() (value driver.Value, err error) {
	if err = c.Validate(nil); err != nil {
		return nil, err
	}

	return c, nil
}

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

func (c Code) Value() (value driver.Value, err error) {
	if err = c.Validate(nil); err != nil {
		return nil, err
	}

	return c, nil
}

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

func (n Number) Value() (value driver.Value, err error) {
	if err = n.Validate(nil); err != nil {
		return nil, err
	}

	return n, nil
}

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
	countries Countries
	currency  Currency
	code      Code
	number    Number
}

type currencies []currency

func (currencies currencies) IsCurrencyIn(curr string) (currency, bool) {
	for _, c := range currencies {
		if string(c.currency) == curr {
			return c, true
		}
	}

	return currency{}, false
}

func (currencies currencies) IsCodeIn(code string) (currency, bool) {
	for _, c := range currencies {
		if string(c.code) == code {
			return c, true
		}
	}

	return currency{}, false
}

func (currencies currencies) IsNumberIn(number string) (currency, bool) {
	for _, c := range currencies {
		if string(c.number) == number {
			return c, true
		}
	}

	return currency{}, false
}

func (c currency) Currency() Currency   { return c.currency }
func (c currency) Code() Code           { return c.code }
func (c currency) Number() Number       { return c.number }
func (c currency) Countries() Countries { return c.countries }

var currenciesByCode = map[string]currency{
    ${render(currenciesByCodeMap)},
}

var currenciesByNumber = map[string]currency{
  ${render(currenciesByNumberMap)},
}

var currenciesByCountry = map[string]currencies{
  ${renderByCountry(currenciesByCountryMap)},
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

func ByCountry(country string) (c []currency, ok bool) {
	c, ok = currenciesByCountry[country]
	return
}
`;

    return template;
}


let normalizeCurrency = (currency) => {
    let normalizeCountry;

    normalizeCountry = (country) => {
        let bracketsFound = false;

        if (country.includes(" (") && country.includes(")")) {
            bracketsFound = true;
            let lastIndexOfOpeningBrackets = country.lastIndexOf(" (");
            let lastIndexOfClosingBrackets = country.lastIndexOf(")");
            let bracked = country.substring(lastIndexOfOpeningBrackets, lastIndexOfClosingBrackets + 1)
            country = country.replace(bracked, "");

            for (let nested = true; nested;) {
                let result = normalizeCountry(country)
                if (result.bracketsFound) {
                    country = result.country
                }

                nested = result.bracketsFound
            }

        }

        return {country: country, bracketsFound: bracketsFound}
    }

    let normalizedResult = normalizeCountry(currency.country)
    if (normalizedResult.bracketsFound) {
        return {
            country: normalizedResult.country,
            currency: currency.currency,
            code: currency.code,
            number: currency.number,
        }
    }

    return null
}

xml2js.parseStringPromise(resp.body.toString(), {mergeAttrs: true})
    .then(result => {
        return Promise.resolve(result["ISO_4217"]["CcyTbl"][0]["CcyNtry"])
    })
    .catch(err => {
        console.log(err);
        os.exit(1)
    })
    .then(currencies => {
        let result = currencies.map((row) => {
            if (!!!(row["Ccy"])) {
                return
            }

            return {
                country: row["CtryNm"][0],
                currency: typeof row["CcyNm"][0] !== "object" ? row["CcyNm"][0] : row["CcyNm"][0]["_"],
                code: row["Ccy"][0],
                number: row["CcyNbr"][0],
            }
        });

        result = result.filter(r => !!r).filter(r => !r.country.startsWith("ZZ"));

        let normalizedCountries = [];

        result.forEach(currency => {
            let normalized = normalizeCurrency(currency)
            if (!!normalized) {
                normalizedCountries.push(normalized)
            }
        })


        return Promise.resolve(result.concat(normalizedCountries))
    })
    .then(currencies => Promise.resolve(render(currencies))).then(template => console.log(template));
