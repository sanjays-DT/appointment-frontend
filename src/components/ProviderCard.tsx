// ProviderCard.tsx (compact version)
import React from "react";
import { Link } from "react-router-dom";

interface ProviderCardProps {
  id: string;
  name: string;
  speciality: string;
  hourlyPrice: number;
  address:string;
  city: string;
  avatar?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  name,
  speciality,
  hourlyPrice,
  address,
  city,
  avatar,
}) => {
  return (
    <Link to={`/provider/${id}`} className="group">
      <div className="bg-white shadow-sm rounded-xl p-3 flex flex-col items-center space-y-1 transform transition duration-200 hover:scale-105 hover:shadow-md">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs ring-1 ring-blue-100">
            No Image
          </div>
        )}

        {/* Provider Info */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-semibold text-base text-gray-800">{name}</h2>
          <p className="text-blue-600 text-sm">{speciality}</p>
          <p className="text-green-500 text-sm font-medium">₹{hourlyPrice}/hr</p>
          <p className="text-gray-500 text-xs mt-0.5">{city}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
