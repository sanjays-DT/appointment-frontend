import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.ts";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  providers?: string[];
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(""); // search term
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

 
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>("/categories");
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  fetchCategories();
}, []);

  // filter categories based on search
  useEffect(() => {
    if (!search) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [search, categories]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">

      {/* Page Title + Search */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Explore Categories
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a category to see available service providers
          </p>
        </div>

        {/* Search Bar on Left */}
        <div className="mt-4 sm:mt-0 max-w-sm w-full">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 flex-1">
        {filteredCategories.length === 0 && (
          <p className="text-gray-500 col-span-full text-center mt-6">
            No categories found.
          </p>
        )}

        {filteredCategories.map((cat) => (
          <Link
            key={cat._id}
            to={`/providers/${cat._id}`}
            className="group"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm 
                 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
              
              {/* Image Section */}
              <div className="h-48 overflow-hidden rounded-t-2xl">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                  {cat.name}
                </h2>

                <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">
                  {cat.description}
                </p>

                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl 
                            text-sm font-semibold hover:bg-blue-700 transition"
                >
                  View Providers →
                </button>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
