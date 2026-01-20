import { useEffect, useState } from "react";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoryCard from "../components/CategoryCard.tsx";
import { Search, Folder } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  /* ===== FETCH CATEGORIES ===== */
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

  /* ===== SEARCH FILTER ===== */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(
        categories.filter((cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, categories]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-theme">
      {/* ===== HERO SECTION ===== */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-14">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Explore Categories
          </h1>

          <p className="text-blue-100 mt-3 max-w-xl mx-auto md:mx-0">
            Find the right service category and connect with trusted providers
          </p>

          {/* SEARCH */}
          <div className="relative mt-8 max-w-md mx-auto md:mx-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-11 pr-4 py-3 rounded-full
                bg-surface-light dark:bg-surface-dark
                text-text-light dark:text-text-dark
                placeholder-muted-light dark:placeholder-muted-dark
                shadow-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-theme
              "
            />
          </div>
        </div>
      </div>

      {/* ===== CATEGORIES GRID ===== */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <Folder
              className="mx-auto mb-4 text-muted-light dark:text-muted-dark"
              size={48}
            />
            <p className="text-xl font-semibold text-text-light dark:text-text-dark">
              No categories found
            </p>
            <p className="text-muted-light dark:text-muted-dark mt-2">
              Try searching with a different keyword
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredCategories.map((cat) => (
              <CategoryCard
                key={cat._id}
                id={cat._id}
                name={cat.name}
                description={cat.description}
                image={`${process.env.REACT_APP_API_URL}/categories/${cat._id}/image`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
