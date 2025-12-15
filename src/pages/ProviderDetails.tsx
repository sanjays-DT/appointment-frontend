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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-base">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start p-4">
      <div className="w-full max-w-xl bg-white p-5 rounded-xl shadow-md border border-gray-200">

        {/* Avatar */}
        <div className="flex justify-center">
          {provider.avatar ? (
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-sm border-2 border-white">
              No Image
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-xl font-semibold text-gray-800 text-center mt-3">
          {provider.name}
        </h1>

        {/* Speciality */}
        <p className="text-blue-600 font-medium text-sm text-center mt-1">
          {provider.speciality}
        </p>

        {/* Bio */}
        {provider.bio ? (
          <p className="text-gray-700 text-center text-sm leading-relaxed px-2 mt-2">
            {provider.bio}
          </p>
        ) : (
          <p className="text-gray-500 text-center text-sm mt-2">No bio available.</p>
        )}

        {/* Rating */}
        <div className="mt-3 flex justify-center items-center text-yellow-500 text-lg">
          ⭐⭐⭐⭐⭐
          <span className="text-gray-600 text-xs ml-1">(5.0)</span>
        </div>

        {/* Location */}
        <p className="text-gray-600 text-center text-sm mt-2">
          📍 <span className="font-medium">{provider.address}</span>
        </p>

        {/* Price */}
        <div className="flex justify-center mt-3">
          <div className="px-3 py-1.5 bg-green-100 text-green-700 font-semibold rounded-full text-sm">
            ₹{provider.hourlyPrice}/hr
          </div>
        </div>

        {/* Book Button */}
        <div className="flex justify-center">
          <Link
            to={`/book/${provider._id}`}
            className="
              mt-5 
              bg-blue-600 
              hover:bg-blue-700 
              text-white 
              font-medium 
              py-2 
              px-6 
              rounded-lg 
              shadow-sm 
              text-sm
              transition
            "
          >
            Book Appointment
          </Link>
        </div>

      </div>
    </div>
  );
}
