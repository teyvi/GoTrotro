import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import { ArrowLeft, MapPin, Clock, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "../assets/Button";
import { cn } from "../lib/utils";
import { LocationResult, TransportationMode } from "../types/mapTypes";
import { GeocoderService } from "../services/GeocoderService";
import { appConfiguration } from "../configuration/config";

const SingleRoutes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(query);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<LocationResult[]>(
    []
  );
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    LocationResult[]
  >([]);
  const [routeAlts, setRouteAlts] = useState(false);

  const handleOriginInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newQuery = e.target.value;
    setOrigin(newQuery);
    setOriginSuggestions([]);

    if (newQuery.length > 2) {
      setIsSearchingOrigin(true);
      try {
        const results = await GeocoderService.searchLocations(newQuery);
        setOriginSuggestions(results);
      } catch (error) {
        console.error("Error fetching origin suggestions:", error);
      } finally {
        setIsSearchingOrigin(false);
      }
    }
  };

  const handleDestinationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newQuery = e.target.value;
    setDestination(newQuery);
    setDestinationSuggestions([]);

    if (newQuery.length > 2) {
      setIsSearchingDestination(true);
      try {
        const results = await GeocoderService.searchLocations(newQuery);
        setDestinationSuggestions(results);
      } catch (error) {
        console.error("Error fetching destination suggestions:", error);
      } finally {
        setIsSearchingDestination(false);
      }
    }
  };

  const handleSelectSuggestion = (
    location: LocationResult,
    isOrigin: boolean
  ) => {
    if (isOrigin) {
      setOrigin(location.place_name);
      setOriginSuggestions([]);
    } else {
      setDestination(location.place_name);
      setDestinationSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const [originResult] = await GeocoderService.searchLocations(origin);
      const [destinationResult] = await GeocoderService.searchLocations(
        destination
      );

      if (!origin || !destination || !originResult || !destinationResult) {
        alert("Enter valid origin and destination");
        return;
      }

      const routingEngine =
        appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine];
      const routes = await routingEngine.getRoute({
        origin: {
          longitude: originResult.coordinates[0],
          latitude: originResult.coordinates[1],
        },
        destination: {
          longitude: destinationResult.coordinates[0],
          latitude: destinationResult.coordinates[1],
        },
        wheelchair: false,
        modes: [TransportationMode.TRANSIT],
      });
      console.log("🚀 ~ handleSubmit ~ originResult:", [
        originResult,
        destinationResult,
      ]);
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      console.error("Error getting route:", error);
      alert("Something went wrong while fetching your route.");
    }
  };

  // Mock route options
  const routeOptions = [
    {
      id: "route-1",
      duration: "35 min",
      fare: "₵5.00",
      steps: [
        {
          type: "walk",
          duration: "5 min",
          description: "Walk to Kwame Nkrumah Circle",
        },
        {
          type: "bus",
          duration: "25 min",
          line: "Accra-Tema",
          description: "Bus to East Legon",
        },
        { type: "walk", duration: "5 min", description: "Walk to destination" },
      ],
    },
    {
      id: "route-2",
      duration: "45 min",
      fare: "₵3.50",
      steps: [
        {
          type: "walk",
          duration: "3 min",
          description: "Walk to Kaneshie Station",
        },
        {
          type: "trotro",
          duration: "30 min",
          line: "Circle-East Legon",
          description: "Trotro to A&C Mall",
        },
        {
          type: "walk",
          duration: "12 min",
          description: "Walk to destination",
        },
      ],
    },
    {
      id: "route-3",
      duration: "50 min",
      fare: "₵4.00",
      steps: [
        {
          type: "walk",
          duration: "7 min",
          description: "Walk to Adabraka Station",
        },
        {
          type: "trotro",
          duration: "40 min",
          line: "Adabraka-Airport",
          description: "Trotro via Ring Road",
        },
        { type: "walk", duration: "3 min", description: "Walk to destination" },
      ],
    },
  ];

  useEffect(() => {
    console.log("Searching for routes to:", query);
  }, [query]);

  const handleRouteSelect = (routeId: string) => {
    navigate(
      `/route/${routeId}?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}`
    );
  };

  return (
    <Layout>
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 relative z-20">
        <div className="absolute inset-0 bg-black opacity-10 pattern-diagonal-lines pattern-white pattern-bg-transparent pattern-size-2 pattern-opacity-5"></div>
        <div className="container mx-auto max-w-lg relative z-10">
          <Button
            variant="ghost"
            className="text-white mb-6 p-0 hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>

          {/* Search Container */}
          <div className="relative">
            <div className="bg-white rounded-xl p-5 shadow-lg transform transition-all hover:shadow-xl">
              {/* Origin Input */}
              <div className="flex items-center gap-3 mb-4 relative">
                <div className="rounded-full bg-red-100 p-2">
                  <MapPin className="text-red-500" size={22} />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Origin"
                    className="w-full p-2 border-b focus:border-red-300 focus:outline-none transition-all"
                    value={origin}
                    onChange={handleOriginInputChange}
                  />

                  {/* Origin Loading State */}
                  {isSearchingOrigin && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Searching origins...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Origin Suggestions */}
                  {originSuggestions.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {originSuggestions.map((suggestion, index) => (
                        <div
                          key={`origin-${index}`}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-start"
                          onClick={() =>
                            handleSelectSuggestion(suggestion, true)
                          }
                        >
                          <div className="mr-3 mt-0.5">
                            <MapPin
                              size={16}
                              className="text-red-500 flex-shrink-0"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.place_name.split(",")[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.place_name
                                .split(",")
                                .slice(1)
                                .join(",")
                                .trim()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Input */}
              <div className="flex items-center gap-3 relative">
                <div className="rounded-full bg-red-100 p-2">
                  <MapPin className="text-red-500" size={22} />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full p-2 border-b focus:border-red-300 focus:outline-none transition-all"
                    value={destination}
                    onChange={handleDestinationInputChange}
                  />

                  {/* Destination Loading State */}
                  {isSearchingDestination && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Searching destinations...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Destination Suggestions */}
                  {destinationSuggestions.length > 0 && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {destinationSuggestions.map((suggestion, index) => (
                        <div
                          key={`dest-${index}`}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-start"
                          onClick={() =>
                            handleSelectSuggestion(suggestion, false)
                          }
                        >
                          <div className="mr-3 mt-0.5">
                            <MapPin
                              size={16}
                              className="text-red-500 flex-shrink-0"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.place_name.split(",")[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.place_name
                                .split(",")
                                .slice(1)
                                .join(",")
                                .trim()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            className=" mt-5 w-full p-2 border-stone-50 bg-gray-400 rounded-2xl focus:border-red-300 focus:outline-none"
            onClick={handleSubmit}
          >
            Search
          </button>
        </div>
      </div>

      {/* Route Options */}
      <div className="container mx-auto max-w-lg p-4 relative z-10">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="bg-red-100 text-red-500 p-1 rounded-md mr-2">
            <Clock size={18} />
          </span>
          Route Options
        </h2>

        {routeOptions.map((route, index) => (
          <div
            key={route.id}
            className="bg-white rounded-xl shadow-md mb-5 overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Clock size={16} className="text-red-500 mr-2" />
                <div className="font-medium">{route.duration}</div>
              </div>
              <div className="flex items-center">
                <DollarSign size={16} className="text-green-600 mr-1" />
                <div className="font-medium">{route.fare}</div>
              </div>
            </div>
            <div className="p-4">
              {route.steps.map((step, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="flex gap-3">
                    <div
                      className={`rounded-full w-8 h-8 flex items-center justify-center text-white ${
                        step.type === "walk"
                          ? "bg-gradient-to-br from-gray-500 to-gray-600"
                          : "bg-gradient-to-br from-red-500 to-red-600"
                      }`}
                    >
                      {step.type === "walk" ? "🚶" : "🚌"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{step.description}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1 inline" />
                        {step.duration}{" "}
                        {step.line && (
                          <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                            {step.line}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {idx < route.steps.length - 1 && (
                    <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4 my-1"></div>
                  )}
                </div>
              ))}
            </div>
            <Button
              className={cn(
                "w-full rounded-none text-white flex justify-between items-center py-3",
                index === 0
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-red-400 hover:bg-red-500"
              )}
              onClick={() => handleRouteSelect(route.id)}
            >
              <span>Select This Route</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default SingleRoutes;
