import MapComponent from "../components/MapComponent";
import SearchComponent from "../components/SearchComponent";
import HomeLayout from "../layouts/HomeLayout";

function Home() {
  return (
    <HomeLayout pageTitle= {<SearchComponent/>}>
    
    <MapComponent />
  </HomeLayout>
  );
}

export default Home;
