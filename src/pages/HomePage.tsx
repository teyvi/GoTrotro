import React from "react";
import MapComponent from "../components/MapComponent";
import SearchComponent from "../components/SearchComponent";
import HomeLayout from "../layouts/HomeLayout";
import "../App.css";
import { LocationProvider } from "../context/LocationContext";

function Home() {
  return (
    <LocationProvider>
      <HomeLayout pageTitle={<SearchComponent />}>
        <MapComponent />
      </HomeLayout>
    </LocationProvider>
  );
}

export default Home;
