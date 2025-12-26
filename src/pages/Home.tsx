import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "../assets/Button";
import { cn } from "../lib/utils";
import {
  LocationResult,
  TransportationMode,
  RouteStep,
  RouteOption,
} from "../types/mapTypes";
import { searchLocations } from "../services/GeocoderService";
import { appConfiguration } from "../configuration/config";
import { useDebounce } from "../hooks/useDebounce"

const SingleRoutes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(query);
  const [originResults, setOriginResults] = useState<LocationResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<
    LocationResult[]
  >([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<LocationResult[]>(
    []
  );
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    LocationResult[]
  >([]);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);

  // const handleOriginInputChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const newQuery = e.target.value;
  //   setOrigin(newQuery);
  //   setOriginSuggestions([]);

  //   if (newQuery.length > 2) {
  //     setIsSearchingOrigin(true);
  //     try {
  //       const results = await searchLocations(newQuery);
  //       setOriginSuggestions(results);
  //       setOriginResults(results);
  //     } catch (error) {
  //       console.error("Error fetching origin suggestions:", error);
  //     } finally {
  //       setIsSearchingOrigin(false);
  //     }
  //   }
  // };

const handleOriginInputChange = (e:React.ChangeEvent<HTMLInputElement> ) => {
setOrigin(e.target.value);
setOriginSuggestions([])
}

const handleDestinationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setDestination(e.target.value);
  setDestinationSuggestions([]);
};

  // const handleDestinationInputChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const newQuery = e.target.value;
  //   setDestination(newQuery);
  //   setDestinationSuggestions([]);

  //   if (newQuery.length > 2) {
  //     setIsSearchingDestination(true);
  //     try {
  //       const results = await searchLocations(newQuery);
  //       setDestinationSuggestions(results);
  //       setDestinationResults(results);
  //     } catch (error) {
  //       console.error("Error fetching destination suggestions:", error);
  //     } finally {
  //       setIsSearchingDestination(false);
  //     }
  //   }
  // };

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

  const routingEngine =
    appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine];

  const routes = async () => {
    try {
      // Ensure we have valid coordinates
      if (!originResults[0] || !destinationResults[0]) {
        alert("Please select valid origin and destination locations");
        return;
      }

      const routingResponse = await routingEngine.getRoute({
        origin: {
          latitude: originResults[0].coordinates[1],
          longitude: originResults[0].coordinates[0],
        },
        destination: {
          latitude: destinationResults[0].coordinates[1],
          longitude: destinationResults[0].coordinates[0],
        },
        wheelchair: false,
        modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
      });

      // Extract itineraries from the response structure
      const itineraries = routingResponse || [];
      const transformedRoutes = transformRoutingResponse(itineraries);
      setRouteOptions(transformedRoutes);
    } catch (error) {
      console.error("Error getting route:", error);
      alert("Something went wrong while fetching your route.");
    }
  };

  const handleSubmit = () => {
    if (
      !origin ||
      !destination ||
      !originResults.length ||
      !destinationResults.length ||
      !originResults[0] ||
      !destinationResults[0]
    ) {
      alert("Enter valid origin and destination");
      return;
    }
    routes();
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (query) {
        setIsSearchingDestination(true);
        try {
          const results = await searchLocations(query);
          if (results.length > 0) {
            setDestinationResults(results);
          }
        } catch (error) {
          console.error("Failed to fetch destination coordinates:", error);
        } finally {
          setIsSearchingDestination(false);
        }
      }
    };

    fetchCoordinates();
  }, [query]);

  const transformRoutingResponse = (itineraries: any[]): RouteOption[] => {
    if (!Array.isArray(itineraries)) {
      return [];
    }

    return itineraries.map((itinerary, index) => {
      // Calculate total duration in minutes
      const durationMinutes = Math.round(itinerary.duration / 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Format start and end times
      const startTime = new Date(itinerary.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endTime = new Date(itinerary.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Transform legs to steps
      const steps: RouteStep[] = itinerary.legs.map((leg: any) => {
        const stepDurationMinutes = Math.round(leg.duration / 60);
        const stepDurationText = `${stepDurationMinutes} min`;

        if (leg.mode === "WALK") {
          return {
            type: "walk",
            description: `Walk to ${leg.to?.name || "next stop"}`,
            duration: stepDurationText,
            line: null,
          };
        } else {
          const lineName =
            leg.routeLongName || leg.routeId?.split(":")[1] || leg.mode;
          return {
            type: "transit",
            description: `Take ${leg.routeLongName} Trotro to ${
              leg.to?.name || "destination"
            }`,
            duration: stepDurationText,
            line: lineName,
          };
        }
      });

      return {
        id: `route-${index}`,
        duration: durationText,
        steps,
        transfers: itinerary.transfers || 0,
        walkDistance: Math.round(itinerary.walkDistance || 0),
        startTime,
        endTime,
      };
    });
  };

  const handleRouteSelect = (routeId: string) => {
    navigate(
      `/route/${routeId}?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}`
    );
  };
  return (
    <>
      <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 relative z-20">
        <div className="absolute inset-0 bg-black opacity-10 pattern-diagonal-lines pattern-white pattern-bg-transparent pattern-size-2 pattern-opacity-5"></div>
        <div className="container mx-auto max-w-lg relative z-10">
              <h1 className="text-6xl font-bold text-white mb-6">GoTrotro</h1>
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

              <div className="flex items-center gap-3 relative">
                <div className="rounded-full bg-green-100 p-2">
                  <MapPin className="text-green-500" size={22} />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full p-2 border-b focus:border-red-300 focus:outline-none transition-all"
                    value={destination}
                    onChange={handleDestinationInputChange}
                  />

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

      <div className="container mx-auto max-w-lg p-4 relative z-10">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="bg-red-100 text-red-500 p-1 rounded-md mr-2">
            <Clock size={18} />
          </span>
          Route Options
        </h2>

        {routeOptions.length === 0 ? (
          <div className="text-gray-500 text-center">
            No routes found. Try searching!
          </div>
        ) : (
          routeOptions.map((route, index) => (
            <div
              key={route.id}
              className="bg-white rounded-xl shadow-md mb-5 overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock size={16} className="text-red-500 mr-2" />
                    <div className="font-medium">{route.duration}</div>
                  </div>
                </div>
              </div>

              {/* Route steps */}
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
                          {step.duration}
                          {step.line && (
                            <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                              Route {step.line}
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
          ))
        )}
      </div>
    </>
  );
};

export default SingleRoutes;
