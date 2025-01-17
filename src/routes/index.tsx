import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

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

async function fetchAllCountries(): Promise<Array<Country>> {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=flag,flags,name,translations,capital,region,languages,currencies,demonyms",
  );

  return res.json();
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: () => fetchAllCountries(),
});

function HomeComponent() {
  const countries = Route.useLoaderData();

  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCountries = countries.filter((country) => {
    let keepItem = true;

    if (searchTerm.trim() !== "") {
      if (
        !country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        keepItem = false;
      }
    }

    return keepItem;
  });

  return (
    <div>
      <h3>ASREC Countries</h3>
      <label htmlFor="search">Rechercher un pays:</label>
      <input
        id="search"
        name="search"
        role="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
      />
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
