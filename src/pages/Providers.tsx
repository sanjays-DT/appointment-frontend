import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.ts";

interface Provider {
  _id: string;
  name: string;
  speciality: string;
  hourlyPrice: number;
  city: string;
  categoryId: { _id: string };
  avatar?: string;
}

export default function Providers() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get<Provider[]>("/providers");
        const filtered = res.data.filter(
          (p) => p.categoryId._id === categoryId
        );
        setProviders(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProviders();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center sm:text-left">
          Available Providers
        </h1>

        {providers.length === 0 ? (
          <p className="text-gray-600 text-lg text-center">No providers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" >
            {providers.map((provider) => (
              <Link key={provider._id} to={`/provider/${provider._id}`}>
                <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center">

                  {/* Avatar */}
                  {provider.avatar ? (
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="h-20 w-20 rounded-full object-cover mb-2 border border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-500 text-sm">
                      No Image
                    </div>
                  )}

                  {/* Name */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    {provider.name}
                  </h2>

                  {/* Speciality */}
                  <p className="text-blue-600 text-sm mt-1">
                    {provider.speciality}
                  </p>

                  {/* Price */}
                  <div className="mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ₹{provider.hourlyPrice}/hr
                  </div>

                  {/* Location */}
                  <p className="text-gray-600 text-xs mt-2">
                    📍 {provider.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
