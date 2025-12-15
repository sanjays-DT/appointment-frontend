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
    <Link to={`/providers?categoryId=${id}`} className="group w-full sm:w-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
        {/* Image */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
        </div>

        {/* Text */}
        <div className="p-4">
          <h2 className="font-semibold text-lg sm:text-xl text-gray-800 truncate">{name}</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
