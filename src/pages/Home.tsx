import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, ArrowRight } from "lucide-react";
 import {
  LocationResult,
  TransportationMode,
  RouteStep,
  RouteOption,
} from "../types/mapTypes";
import { appConfiguration } from "../configuration/config";
import { useDebounce } from "../hooks/useDebounce";
import { useLocationSearch } from "../queries/searchLocations";

const SingleRoutes = () => {
  const navigate = useNavigate();

  //location input states
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // Selected location states
  const [selectedOrigin, setSelectedOrigin] = useState<LocationResult | null>(
    null
  );
  const [selectedDestination, setSelectedDestination] =
    useState<LocationResult | null>(null);

  // UI states
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Debounced search values
  const debouncedOrigin = useDebounce(origin, 500);
  const debouncedDestination = useDebounce(destination, 500);

  //origin location search query
  const { data: originResults = [], isLoading: isSearchingOrigin } =
    useLocationSearch(debouncedOrigin, showOriginSuggestions && debouncedOrigin.length > 2);

  //destination location search query
  const { data: destinationResults = [], isLoading: isSearchingDestination } =
    useLocationSearch(debouncedDestination, showDestinationSuggestions && debouncedDestination.length > 2);

  const handleOriginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOrigin(value);
    setShowOriginSuggestions(true);
    setSelectedOrigin(null);
  };

  const handleDestinationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDestination(value);
    setShowDestinationSuggestions(true);
    setSelectedDestination(null);
  };

  const handleSelectOrigin = (location: LocationResult) => {
    setOrigin(location.place_name);
    setSelectedOrigin(location);
    setShowOriginSuggestions(false);
  };

  const handleSelectedDestination = (location: LocationResult) => {
    setDestination(location.place_name);
    setSelectedDestination(location);
    setShowDestinationSuggestions(false);
  };

  const routingEngine =
    appConfiguration.routingEngines[appConfiguration.defaultRoutingEngine];

  const fetchRoutes = async () => {
    try {
      if (!selectedOrigin || !selectedDestination) {
        alert("Please select valid origin and destination locations");
        return;
      }

      setIsLoadingRoutes(true);
      setRouteOptions([]);
      setHasSearched(false);

      const routingResponse = await routingEngine.getRoute({
        origin: {
          latitude: selectedOrigin.coordinates[1],
          longitude: selectedOrigin.coordinates[0],
        },
        destination: {
          latitude: selectedDestination.coordinates[1],
          longitude: selectedDestination.coordinates[0],
        },
        wheelchair: false,
        modes: [TransportationMode.TRANSIT, TransportationMode.WALK],
      });

      const itineraries = routingResponse || [];
      const transformedRoutes = transformRoutingResponse(itineraries);
      setRouteOptions(transformedRoutes);
      setHasSearched(true);
    } catch (error) {
      console.error("Error getting route:", error);
      alert("The trip is not availble at the moment");
      setRouteOptions([]);
      setHasSearched(true);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedOrigin || !selectedDestination) {
      alert("Please select valid origin and destination from the suggestions");
      return;
    }
    fetchRoutes();
  };

  const transformRoutingResponse = (itineraries: any[]): RouteOption[] => {
    if (!Array.isArray(itineraries)) {
      return [];
    }

    return itineraries.map((itinerary, index) => {
      const durationMinutes = Math.round(itinerary.duration / 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const startTime = new Date(itinerary.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endTime = new Date(itinerary.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

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
            description: `Take ${leg.routeLongName} Trotro to ${leg.to?.name || "destination"
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
    if (!selectedOrigin || !selectedDestination) {
      return;
    }

    const originCoords = `${selectedOrigin.coordinates[0]},${selectedOrigin.coordinates[1]}`;
    const destCoords = `${selectedDestination.coordinates[0]},${selectedDestination.coordinates[1]}`;

    navigate(
      `/route/${routeId}?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}&originCoords=${originCoords}&destCoords=${destCoords}`
    );
  };
  return (
    <>
      <header>
        <div className="centered-container">
          <h1>GoTrotro</h1>
          <form>
              {/* Origin Input */}
              <div>
                <MapPin className="start-pin" size={22} />
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Origin"
                    value={origin}
                    onChange={handleOriginInputChange}
                    onFocus={() => setShowOriginSuggestions(true)}
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

                  {showOriginSuggestions &&
                    !isSearchingOrigin &&
                    originResults.length > 0 && (
                      <ul className="search-suggestions">
                        {originResults.map((suggestion, index) => (
                          <li
                            key={`origin-${index}`}
                            tabIndex={0}
                            onClick={() => handleSelectOrigin(suggestion)}
                          >
                            <MapPin
                              className="start-pin"
                              size={16}
                             />
                            <div>
                              <p className="title">
                                {suggestion.place_name.split(",")[0]}
                              </p>
                              <p className="address">
                                {suggestion.place_name
                                  .split(",")
                                  .slice(1)
                                  .join(",")
                                  .trim()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                  {showOriginSuggestions &&
                    !isSearchingOrigin &&
                    debouncedOrigin.length > 2 &&
                    originResults.length === 0 && (
                      <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                        <p className="text-sm text-gray-600 text-center">
                          No results found
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/*Destination input*/}
              <div>
                <MapPin className="dest-pin" size={22} />
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Destination"
                    value={destination}
                    onChange={handleDestinationInputChange}
                    onFocus={() => setShowDestinationSuggestions(true)}
                  />

                  {isSearchingDestination && showDestinationSuggestions && (
                    <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">
                          Searching...
                        </span>
                      </div>
                    </div>
                  )}

                  {showDestinationSuggestions &&
                    !isSearchingDestination &&
                    destinationResults.length > 0 && (
                      <ul className="search-suggestions">
                        {destinationResults.map((suggestion, index) => (
                          <li
                            key={`dest-${index}`}
                            tabIndex={0}
                            onClick={() =>
                              handleSelectedDestination(suggestion)
                            }
                          >
                            <MapPin
                              size={16}
                              className="start-pin"
                              />
                            <div>
                              <p className="title">
                                {suggestion.place_name.split(",")[0]}
                              </p>
                              <p className="address">
                                {suggestion.place_name
                                  .split(",")
                                  .slice(1)
                                  .join(",")
                                  .trim()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                  {showDestinationSuggestions &&
                    !isSearchingDestination &&
                    debouncedDestination.length > 2 &&
                    destinationResults.length === 0 && (
                      <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                        <p className="text-sm text-gray-600 text-center">
                          No results found
                        </p>
                      </div>
                    )}
                </div>
              </div>
              {/* search button*/}
              <input
                type="submit"
                onClick={handleSubmit}
                disabled={isLoadingRoutes}
                value={isLoadingRoutes ? "Searching..." : "Search"}
              />
          </form>
        </div>
      </header>

      <div className="centered-container">
        {isLoadingRoutes ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
            <p className="text-gray-600">Finding routes...</p>
          </div>
        ) : !hasSearched ? null : routeOptions.length === 0 ? (
          <>
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="bg-red-100 text-red-500 p-1 rounded-md mr-2">
                <Clock size={18} />
              </span>
              Route Options
            </h2>
            <div className="text-gray-500 text-center">
              No routes found. Try searching!
            </div>
          </>

        ) : (
          routeOptions.map((route, index) => (
            <div
              key={route.id}
              className="route-details-container"
            >
              <div className="title">
                <Clock size={16} />
                <span>{route.duration}</span>
              </div>

              <ol className="route-details">
                {route.steps.map((step, idx) => (
                  // ToDo: Recycle style from "Route details" on map view.
                  <li key={idx}>
                    <div aria-hidden={true} role="presentation"
                        // ToDo: Replace symbol markup with real SVG
                        className={`${step.type === "walk"
                            ? "walk-symbol"
                            : "pt-symbol"
                          }`}
                      >
                        {step.type === "walk" ? "🚶" : "🚌"}
                    </div>
                    <p>
                      <span className="title">{step.description}</span>
                      <span className="description">
                        <Clock size={14} className="" />
                        {step.duration}
                        {step.line && (
                          <span className="label label-red">
                            Route {step.line}
                          </span>
                        )}
                      </span>
                    </p>
                    {idx < route.steps.length - 1 && (
                      <div className="border-l-2 border-dashed border-gray-300 h-6 ml-4 my-1"></div>
                    )}
                  </li>
                ))}
              </ol>

              <button
                onClick={() => handleRouteSelect(route.id)}
              >
                <span>Select This Route</span>
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default SingleRoutes;
