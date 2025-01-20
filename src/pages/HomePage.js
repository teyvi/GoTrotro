import MapComponent from "../components/MapComponent";
import SearchComponent from "../components/SearchComponent";
import HomeLayout from "../layouts/HomeLayout";
import '../App.css'

function Home() {
  return (
    <HomeLayout pageTitle= {<SearchComponent/>}>
    <MapComponent/>
  </HomeLayout>
  );
}

export default Home;
