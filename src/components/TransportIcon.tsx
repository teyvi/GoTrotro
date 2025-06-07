
import React from 'react';

type IconType = 'bus' | 'train' | 'tram' | 'metro';

interface TransportIconProps {
  type: IconType;
  code?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getColor = (type: IconType) => {
  switch (type) {
    case 'bus':
      return 'bg-blue-600';
    case 'train':
      return 'bg-red-600';
    case 'tram':
      return 'bg-green-600';
    case 'metro':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

const getSize = (size: string) => {
  switch (size) {
    case 'sm':
      return 'w-6 h-6 text-xs';
    case 'lg':
      return 'w-10 h-10 text-base';
    default:
      return 'w-8 h-8 text-sm';
  }
};

const TransportIcon: React.FC<TransportIconProps> = ({ type, code, size = 'md' }) => {
  const colorClass = getColor(type);
  const sizeClass = getSize(size);

  return (
    <div className={`${colorClass} ${sizeClass} rounded-full flex items-center justify-center text-white font-bold`}>
      {code || type[0].toUpperCase()}
    </div>
  );
};

export default TransportIcon;