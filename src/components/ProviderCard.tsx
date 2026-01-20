import React from "react";
import { Link } from "react-router-dom";

interface ProviderCardProps {
  id: string;
  name: string;
  speciality: string;
  hourlyPrice: number;
  address: string;
  city: string;
  avatar?: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  name,
  speciality,
  hourlyPrice,
  city,
  avatar,
}) => {
  return (
    <Link to={`/provider/${id}`} className="group">
      <div
        className="
          rounded-2xl p-5 h-full
          shadow-sm hover:shadow-xl
          transition-all duration-300 hover:-translate-y-1
          bg-surface-light dark:bg-surface-dark
          border border-border-light dark:border-border-dark
          transition-theme
        "
      >
        {/* Avatar */}
        <div className="flex justify-center">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="
                w-20 h-20 rounded-full object-cover
                ring-4 ring-blue-100 dark:ring-blue-300
                transition-transform duration-300 group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700
                flex items-center justify-center
                text-gray-500 dark:text-gray-300 text-sm
                ring-4 ring-blue-100 dark:ring-blue-300
              "
            >
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center mt-4">
          <h2 className="text-lg font-bold text-text-light dark:text-text-dark leading-tight">
            {name}
          </h2>

          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
            {speciality}
          </p>

          {/* Price */}
          <div className="mt-4">
            <span
              className="
                inline-block bg-green-100 dark:bg-green-800
                text-green-700 dark:text-green-200
                px-4 py-1 rounded-full
                text-sm font-semibold
              "
            >
              ₹{hourlyPrice}/hr
            </span>
          </div>

          {/* Location */}
          <p className="text-muted-light dark:text-muted-dark text-sm mt-3">
            📍 {city}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProviderCard;
