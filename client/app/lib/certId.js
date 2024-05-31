import { countryInfo } from "./countriesDetailed";

const CONTROL_NUMBER = "54491206714271"; // This is the "secret" Maternity control digits
const countries = countryInfo.countries;

const DEBUG = false;

function stringify(input, minLength = 0) {
    const str = String(input);
    if (str.length < minLength) {
        let pad = "";
        for (let i = 0; i < minLength - str.length; i++) {
            pad += "0";
        }
        return `${pad}${str}`;
    }
    return str;
}


function getCountryByNumeric(numericCode) {
    for (const code in countries) {
        if (Object.prototype.hasOwnProperty.call(countries, code)) {
            if (countries[code].numeric === numericCode) {
                return countries[code];
            }
        }
    }
    return undefined;
}

export function getCertInfo(raw) {
    const input = stringify(parseInt(raw.replace(/-/g, ''), 32), 14); // Convert from redix=32 to 10

    // Already validated:
    const year = `${input[4]}${input[5]}`;
    const month = `${input[6]}${input[7]}`;
    const day = `${input[8]}${input[9]}`;

    const dateStr = `20${year}-${month}-${day}`;

    // const date = moment.utc(`${year}${month}${day}`, "YYMMDD").format("YYYY-MM-DD");
    const countryCode = `${input[10]}${input[11]}${input[12]}`;
    const country = getCountryByNumeric(countryCode);

    const valid = modulo11(input, 14) === 0 &&
                    parseInt(year) >= 0 && parseInt(year) < 100 &&
                    parseInt(month) >= 1 && parseInt(month) < 13 &&
                    parseInt(day) >= 1 && parseInt(day) < 32 &&
                    country !== undefined;
    return {
        valid,
        date: dateStr,
        country: country ? country.name : "N/A",
    };
}

function modulo11(input, length) {
    const str = stringify(input, length);

    let sum = 0;
    for (let i = 0; i < length; i++) {
        let digit = Number(str[i]);
        let control = Number(CONTROL_NUMBER[i]);
        sum += digit * control;
        if (DEBUG) {
            console.log("digit:", digit, control, digit * control);
        }
    }

    if (DEBUG) {
        console.log(`modulo11:     ${sum} % 11 = ${sum % 11}  |  valid =`, sum % 11 === 0);
    }
    return sum % 11;
}
