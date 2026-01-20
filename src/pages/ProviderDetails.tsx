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
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-theme">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center">
            {provider.avatar ? (
              <img
                src={`${process.env.REACT_APP_API_URL}/providers/${provider._id}/avatar`}
                alt={provider.name}
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg transition-theme"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 ring-4 ring-white transition-theme">
                No Image
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4">
            {provider.name}
          </h1>

          <p className="text-blue-100 mt-2 text-lg">
            {provider.speciality}
          </p>
        </div>
      </div>

      {/* ===== Content Card ===== */}
      <div className="max-w-4xl mx-auto px-6 -mt-12">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg p-6 md:p-8 transition-theme">
          {/* Bio */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
              About
            </h2>

            {provider.bio ? (
              <p className="text-muted-light dark:text-muted-dark mt-2 leading-relaxed">
                {provider.bio}
              </p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                No bio available.
              </p>
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 text-center">
            <div>
              <p className="text-muted-light dark:text-muted-dark text-sm">Location</p>
              <p className="font-medium text-text-light dark:text-text-dark mt-1">
                📍 {provider.address}
              </p>
            </div>

            <div>
              <p className="text-muted-light dark:text-muted-dark text-sm">Price</p>
              <p className="font-semibold text-green-700 dark:text-green-500 mt-1">
                ₹{provider.hourlyPrice}/hr
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex justify-center mt-6 text-yellow-500 text-lg">
            ⭐⭐⭐⭐⭐
            <span className="text-muted-light dark:text-muted-dark text-sm ml-2">(5.0 rating)</span>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-8">
            <Link
              to={`/book/${provider._id}`}
              className="
                bg-blue-600 hover:bg-blue-700
                text-white font-semibold
                px-8 py-3 rounded-xl
                shadow-md transition
              "
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
