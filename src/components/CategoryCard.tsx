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
    <Link to={`/providers/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
        {/* Image */}
        <div className="h-48 overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={name}
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
        </div>

        {/* Text */}
        <div className="p-5 flex flex-col flex-1">
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">{name}</h2>
          <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">{description}</p>
           <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            View Providers →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
