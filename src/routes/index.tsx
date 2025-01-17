import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

interface Country {
  flags: string;
  name: { common: string };
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
    <div className="p-2">
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
      {countries.map((country) => {
        return <CountryItem country={country} />;
      })}
    </section>
  );
}

function CountryItem({ country }: { country: Country }) {
  return (
    <article>
      <h1>{country.name.common}</h1>
    </article>
  );
}
