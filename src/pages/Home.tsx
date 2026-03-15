import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
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
                    <p className="notification-text">Searching origins...</p>
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
                      <p className="notification-text">No results found</p>
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
                    <p className="notification-text">Searching...</p>
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
                        <p className="notification-text">No results found</p>
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
          <p className="notification-text">Finding routes...</p>
        ) : !hasSearched ? null : routeOptions.length === 0 ? (
          <>
            <p className="notification-text">
              No routes found. Try searching!
            </p>
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
