import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

function Loader() {
  return <div>En cours de chargement</div>;
}

interface Country {
  capital: Array<string>;
  flags: { png: string; alt: string };
  name: { common: string };
  translations: {
    fra: { common: string };
  };
  region: string;
  languages: { [key: string]: string };
  currencies: { [key: string]: { name: string; symbol: string } };
  demonyms: {
    fra: {
      f: string;
      m: string;
    };
  };
}

type CurrencyFilter = "EURO" | "DOLLAR" | "POUND" | "NONE";

async function fetchAllCountries(): Promise<Array<Country>> {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=flag,flags,name,translations,capital,region,languages,currencies,demonyms",
  );

  return res.json();
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
  pendingComponent: Loader,
  loader: () => fetchAllCountries(),
});

function HomeComponent() {
  const countries = Route.useLoaderData();
  console.log(countries);

  const regions = countries.reduce((acc, value) => {
    if (acc.has(value.region)) {
      return acc;
    }

    return acc.add(value.region);
  }, new Set<string>());

  const [searchTerm, setSearchTerm] = React.useState("");

  const [activeCurrencyFilter, setActiveCurrencyFilter] =
    React.useState<CurrencyFilter>("NONE");

  const [regionFilter, setRegionFilter] = React.useState<string>("");

  const filteredCountries = countries.filter((country) => {
    let keepItem = true;

    if (searchTerm.trim() !== "") {
      if (
        !country.translations.fra.common
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        keepItem = false;
      }
    }

    if (regionFilter !== "") {
      if (country.region !== regionFilter) {
        keepItem = false;
      }
    }

    if (activeCurrencyFilter === "EURO") {
      if (
        !Object.values(country.currencies).some(
          (currency) => currency.name === "Euro",
        )
      ) {
        keepItem = false;
      }
    }

    if (activeCurrencyFilter === "POUND") {
      if (
        !Object.values(country.currencies).some(
          (currency) => currency.name === "British pound",
        )
      ) {
        keepItem = false;
      }
    }

    if (activeCurrencyFilter === "DOLLAR") {
      if (
        !Object.values(country.currencies).some(
          (currency) => currency.name === "United States dollar",
        )
      ) {
        keepItem = false;
      }
    }

    return keepItem;
  });

  return (
    <div>
      <h3>ASREC Countries</h3>
      <div>
        <label htmlFor="search">Rechercher un pays:</label>
        <input
          id="search"
          name="search"
          role="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </div>
      <div>
        <label htmlFor="regionFilter">Filtrer par région:</label>
        <select
          name="regionFilter"
          id="regionFilter"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.currentTarget.value)}
        >
          <option value="">-- Sélectionner une région --</option>
          {Array.from(regions).map((region) => {
            return (
              <option key={region} value={region}>
                {region}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <span id="currencyFilterLabel">Filtrer par monnaie:</span>
        <div role="group" aria-labelledby="currencyFilterLabel">
          <button
            aria-current={activeCurrencyFilter === "NONE"}
            className="secondary"
            onClick={() => setActiveCurrencyFilter("NONE")}
          >
            ALL
          </button>
          <button
            aria-current={activeCurrencyFilter === "EURO"}
            className="secondary"
            onClick={() => setActiveCurrencyFilter("EURO")}
          >
            €
          </button>
          <button
            aria-current={activeCurrencyFilter === "DOLLAR"}
            className="secondary"
            onClick={() => setActiveCurrencyFilter("DOLLAR")}
          >
            $
          </button>
          <button
            aria-current={activeCurrencyFilter === "POUND"}
            className="secondary"
            onClick={() => setActiveCurrencyFilter("POUND")}
          >
            £
          </button>
        </div>
      </div>
      <CountryList countries={filteredCountries} />
    </div>
  );
}

function CountryList({ countries }: { countries: Country[] }) {
  return (
    <section>
      <ul>
        {countries.map((country) => {
          return <CountryItem key={country.name.common} country={country} />;
        })}
      </ul>
    </section>
  );
}

function CountryItem({ country }: { country: Country }) {
  return (
    <li>
      <article>
        <span>
          <img src={country.flags.png} alt={country.flags.alt} width={32} />
        </span>
        <h1>{country.translations.fra.common}</h1>
        <span>({country.name.common})</span>
        <dl>
          <dt>Capitale:</dt>
          <dd>{country.capital[0] || "NA"}</dd>

          <dt>Region:</dt>
          <dd>{country.region}</dd>

          <dt>Langues:</dt>
          <dd>{Object.values(country.languages).join(", ") || "NA"}</dd>

          <dt>Monnaie:</dt>
          <dd>
            {Object.values(country.currencies)
              .map((currency) => {
                return `${currency.name} (${currency.symbol})`;
              })
              .join(", ") || "NA"}
          </dd>

          <dt>Demonyms:</dt>
          <dd>
            {`F: ${country.demonyms.fra.f || "NA"} M: ${country.demonyms.fra.m || "NA"}`}
          </dd>
        </dl>
      </article>
    </li>
  );
}
