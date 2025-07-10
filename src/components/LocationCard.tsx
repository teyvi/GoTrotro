import React from 'react';
import TransportIcon from './TransportIcon';

interface LocationCardProps {
  name: string;
  district?: string;
  type: 'bus' | 'train' | 'tram' | 'metro';
  code?: string;
  onClick?: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  name,
  district,
  type,
  code,
  onClick
}) => {
  return (
    <div className="location-card" onClick={onClick}>
      <TransportIcon type={type} code={code} />
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        {district && <span className="text-sm text-gray-300">{district}</span>}
      </div>
    </div>
  );
};

export default LocationCard;