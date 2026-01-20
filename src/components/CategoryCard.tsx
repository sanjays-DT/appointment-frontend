import React from "react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ id, name, description, image }) => {
  return (
    <Link to={`/providers/${id}`} className="group relative">
      <div className="relative rounded-2xl overflow-hidden shadow-lg
                      transform transition duration-500 hover:scale-105 hover:shadow-2xl
                      border border-border-light dark:border-border-dark
                      bg-surface-light dark:bg-surface-dark transition-theme">
        
        {/* Image */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
                          transition-opacity duration-500 group-hover:opacity-60"></div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark
                         group-hover:text-blue-600 transition-colors">
            {name}
          </h2>
          <p className="text-muted-light dark:text-muted-dark text-sm line-clamp-3">
            {description}
          </p>

          {/* CTA Button */}
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm shadow
                             hover:bg-blue-700 hover:scale-105 transition-all duration-300">
            Book Now →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
