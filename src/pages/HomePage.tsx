 import SearchBar from "../components/Search";
 
function Home() {
  return (
    <>
         <div className="flex flex-col min-h-screen">
          <div className="bg-red-500 px-4 py-8 md:py-12">
            <div className="container mx-auto max-w-lg">
              <h1 className="text-6xl font-bold text-white mb-6">GoTrotro</h1>
              <SearchBar />
            </div>
          </div>
        </div>
     </>
  );
}

export default Home;
