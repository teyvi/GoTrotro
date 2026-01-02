import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
 import { ArrowLeft, MapPin, Bell,Ticket } from 'lucide-react';
import { Button } from '../assets/Button';


//this is just a sample code or the ui. not fully integrated
// Mock data for a single route
const routeData = {
  id: "route-1",
  departureTime: "10:26",
  arrivalTime: "12:24",
  duration: "1 h 58 min",
  steps: [
    {
      id: "step-1",
      time: "10:26",
      location: "Circle Interchange, Accra",
      detail: "Start",
      platform: "Platform 2",
      transitLine: {
        code: "U1",
        name: "Direction of Madina",
        color: "bg-blue-500",
        type: "bus"
      },
      stops: 10,
      stopDuration: "19 min"
    },
    {
      id: "step-2",
      time: "10:45", 
      location: "Osu",
      detail: "Transfer",
      platform: "Platform 1",
    },
    {
      id: "step-3",
      time: "11:00",
      location: "Airport Residential",
      detail: "Walk 2 min",
      transitLine: {
        code: "T2",
        name: "Direction of East Legon",
        color: "bg-green-500",
        type: "trotro"
      },
      stops: 7,
      stopDuration: "15 min"
    },
    {
      id: "step-4",
      time: "12:24",
      location: "University of Ghana, Legon",
      detail: "Destination",
      platform: "Platform 3"
    }
  ],
  announcements: [
    { id: 1, text: "Delays possible due to traffic on Ring Road" }
  ],
  changes: [
    { id: 1, detail: "Change line (walk 2 min, wait 2 min)" }
  ]
};

const RouteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(routeData);

  useEffect(() => {
    setRoute(routeData);
  }, [id]);

  if (!route) {
    return <div>Loading route details...</div>;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Map section */}
        <div className="relative w-full h-80">
           <Button 
            variant="outline" 
            className="absolute top-4 left-4 bg-black bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </Button>
        </div>

        {/* Route summary */}
        <div className="bg-black text-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="text-2xl font-bold">Leaves at {route.departureTime}</div>
            <div className="text-2xl font-bold">{route.duration}</div>
          </div>
          <div className="text-gray-300 flex items-center">
            <span>Arrival {route.arrivalTime}</span>
          </div>
          <div className="mt-4 relative">
            <div className="absolute right-0 top-0">
              <Button 
                variant="outline" 
                className="rounded-full bg-black bg-opacity-70 border-white p-2 hover:bg-gray-800"
              >
                <Bell size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Route steps */}
        <div className="bg-gray-900 flex-grow text-white px-4 py-6">
          {route.steps.map((step, index) => (
            <div key={step.id} className="mb-6 relative">
              {/* Timeline line */}
              {index < route.steps.length - 1 && (
                <div className="absolute left-6 top-8 w-0.5 bg-gray-600 h-full -ml-[2px]"></div>
              )}
              
              <div className="flex gap-4">
                {/* Time column */}
                <div className="min-w-[80px] pt-1">
                  <div className="text-xl font-bold">{step.time}</div>
                </div>
                
                {/* Content column */}
                <div className="flex-1">
                  <div className="flex gap-2 items-start">
                    {step.transitLine ? (
                      <div className={`rounded min-w-[40px] h-[40px] ${step.transitLine.color} flex items-center justify-center text-white font-bold`}>
                        {step.transitLine.code}
                      </div>
                    ) : (
                      <div className="rounded min-w-[40px] h-[40px] bg-gray-600 flex items-center justify-center">
                        <MapPin className="text-white" size={20} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{step.location}</div>
                      <div className="text-gray-400">{step.detail}</div>
                      
                      {step.transitLine && (
                        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`rounded min-w-[40px] h-[26px] ${step.transitLine.color} flex items-center justify-center text-white font-bold text-sm`}>
                              {step.transitLine.code}
                            </div>
                            <span>{step.transitLine.name}</span>
                          </div>
                          
                          {step.stops && (
                            <div className="flex justify-between items-center mt-2 text-gray-300">
                              <div>Take {step.stops} stops ({step.stopDuration})</div>
                              <div>
                                <ArrowLeft className="rotate-180" size={18} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {step.platform && (
                        <div className="mt-2 flex justify-end">
                          <span className="text-sm text-gray-400">{step.platform}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Announcements */}
          {route.announcements && route.announcements.length > 0 && (
            <div className="bg-blue-800 bg-opacity-40 rounded-lg p-4 mb-4 flex items-center gap-3">
              <Bell size={20} className="text-blue-300" />
              <div className="text-blue-100">
                {route.announcements.length} announcement{route.announcements.length > 1 ? 's' : ''}
              </div>
            </div>
          )}
          
          {/* Route changes */}
          {route.changes && route.changes.map((change) => (
            <div key={change.id} className="border-t border-gray-700 py-4 flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <ArrowLeft className="-rotate-45" size={14} />
              </div>
              <div className="text-gray-200">{change.detail}</div>
            </div>
          ))}
        </div>
        
        {/* Bottom ticket action */}
        <div className="bg-gray-800 p-4 flex justify-end">
          <Button className="bg-blue-700 hover:bg-blue-800 gap-2 px-6 py-3 rounded-full">
            <Ticket size={20} />
            <span>Ticket</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default RouteDetails;
