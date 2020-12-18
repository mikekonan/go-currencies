// This code is auto-generated; DO NOT EDIT.
package currency

import (
	"database/sql/driver"
	"fmt"
)

type Country string

func (country Country) Value() (value driver.Value, err error) {
	if err = country.Validate(nil); err != nil {
		return nil, err
	}

	return country.String(), nil
}

func (country Country) Validate(_ interface{}) error {
	if _, ok := ByCountry(string(country)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 country", country)
	}

	return nil
}

func (country Country) IsSet() bool {
	return len(string(country)) > 0
}

func (country Country) String() string {
	return string(country)
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

func (currency Currency) Value() (value driver.Value, err error) {
	if err = currency.Validate(nil); err != nil {
		return nil, err
	}

	return currency.String(), nil
}

func (currency Currency) Validate(_ interface{}) error {
	if _, ok := ByCurrency(string(currency)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 currency", currency)
	}

	return nil
}

func (currency Currency) IsSet() bool {
	return len(string(currency)) > 0
}

func (currency Currency) String() string {
	return string(currency)
}

type Code string

func (code Code) Value() (value driver.Value, err error) {
	if err = code.Validate(nil); err != nil {
		return nil, err
	}

	return code.String(), nil
}

func (code Code) Validate(_ interface{}) error {
	if _, ok := ByCode(string(code)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 code", code)
	}

	return nil
}

func (code Code) IsSet() bool {
	return len(string(code)) > 0
}

func (code Code) String() string {
	return string(code)
}

type Number string

func (number Number) Value() (value driver.Value, err error) {
	if err = number.Validate(nil); err != nil {
		return nil, err
	}

	return number.String(), nil
}

func (number Number) Validate(_ interface{}) error {
	if _, ok := ByNumber(string(number)); !ok {
		return fmt.Errorf("'%s' is not valid ISO-4217 number", number)
	}

	return nil
}

func (number Number) IsSet() bool {
	return len(string(number)) > 0
}

func (number Number) String() string {
	return string(number)
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