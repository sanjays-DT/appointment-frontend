import { useEffect, useState } from "react";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryCard from "../components/CategoryCard.tsx";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Fetch categories
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

  // Search filter logic
  useEffect(() => {
    if (!search) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [search, categories]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      
      {/* Title & Search */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Explore Categories
          </h1>
          <p className="text-gray-600 mt-2">
            Choose a category to see available service providers
          </p>
        </div>

        <div className="mt-4 sm:mt-0 max-w-sm w-full">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 
              text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
          <CategoryCard
            key={cat._id}
            id={cat._id}
            name={cat.name}
            description={cat.description}
            image={cat.image}
          />
        ))}
      </div>
    </div>
  );
}
