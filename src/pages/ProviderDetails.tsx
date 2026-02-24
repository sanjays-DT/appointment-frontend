import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.ts";

interface Provider {
  _id: string;
  name: string;
  speciality: string;
  bio?: string;
  hourlyPrice: number;
  address: string;
  avatar?: string;
}

export default function ProviderDetails() {
  const { providerId } = useParams<{ providerId: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await api.get<Provider>(`/providers/${providerId}`);
        setProvider(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProvider();
  }, [providerId]);

  if (!provider) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark transition-theme">
        <p className="text-text-light dark:text-text-dark text-lg">Loading profile...</p>
      </div>
    );
  }

return (
  <div className="min-h-[552px] flex justify-center items-center bg-gray-100 dark:bg-neutral-950 px-4">

    <div className="h-[501px] w-full max-w-5xl h-full bg-white dark:bg-neutral-900 
                    rounded-3xl shadow-xl overflow-hidden flex">

      {/* ===== LEFT SIDE - IMAGE ===== */}
      <div className="w-1/2 h-full">

        {provider.avatar ? (
          <img
            src={`${process.env.REACT_APP_API_URL}/providers/${provider._id}/avatar`}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            No Image
          </div>
        )}

      </div>

      {/* ===== RIGHT SIDE - DETAILS ===== */}
      <div className="w-1/2 h-full p-8 flex flex-col justify-between">

        {/* Top Section */}
        <div>

          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {provider.name}
          </h1>

          <p className="text-blue-600 dark:text-blue-400 mt-2">
            {provider.speciality}
          </p>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            📍 {provider.address}
          </p>

          <div className="flex items-center gap-2 mt-4 text-sm">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-gray-500 dark:text-gray-400">
              4.9 (120 reviews)
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              About Service
            </h2>

            {provider.bio ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                {provider.bio}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                No bio available.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Section */}
        <div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ₹{provider.hourlyPrice}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                per hour
              </p>
            </div>
          </div>

          <Link
            to={`/book/${provider._id}`}
            className="block w-full text-center bg-amber-600 hover:bg-amber-700 
                       text-white font-semibold py-3 rounded-2xl transition"
          >
            Book Now
          </Link>

        </div>

      </div>

    </div>

  </div>
);

}