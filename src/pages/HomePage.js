import MapComponent from "../components/MapComponent";
import SearchComponent from "../components/SearchComponent";
import HomeLayout from "../layouts/HomeLayout";
import '../styles/Home.css'

function Home() {
  return (
    <HomeLayout pageTitle= {<SearchComponent/>}>
    
    <MapComponent />
  </HomeLayout>
  );
}

export default Home;
