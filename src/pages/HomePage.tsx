import React from "react";
import SearchBar from "../components/Search";
import LocationCard from "../components/LocationCard";
import Layout from "../layouts/Layout";

function Home() {
  const frequentLocations = [
    {
      id: 1,
      name: "Circle Interchange",
      district: "Central Accra",
      type: "bus" as const,
      code: "C",
    },
    {
      id: 2,
      name: "Accra Mall",
      district: "East Legon",
      type: "bus" as const,
      code: "AM",
    },
    {
      id: 3,
      name: "Kaneshie Market",
      district: "Kaneshie",
      type: "metro" as const,
      code: "KM",
    },
    {
      id: 4,
      name: "Makola Market",
      district: "Central Accra",
      type: "tram" as const,
      code: "M",
    },
  ];

  return (
    <>
      <Layout>
        <div className="flex flex-col min-h-screen">
          <div className="bg-red-500 px-4 py-8 md:py-12">
            <div className="container mx-auto max-w-lg">
              <h1 className="text-6xl font-bold text-white mb-6">GoTrotro</h1>
              <SearchBar />
            </div>
          </div>

          <div className="bg-black px-4 py-6 flex-grow">
            <div className="container mx-auto max-w-lg">
              <h2 className="text-xl text-white font-bold mb-4">
                Frequently used
              </h2>

              {frequentLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  name={location.name}
                  district={location.district}
                  type={location.type}
                  code={location.code}
                  onClick={() => console.log(`Selected ${location.name}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Home;
