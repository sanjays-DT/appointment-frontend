import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.ts";
import ProviderCard from "../components/ProviderCard.tsx";

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

        // Filter providers by category
        const filtered = res.data.filter(
          (p) => p.categoryId?._id === categoryId
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
          <p className="text-gray-600 text-lg text-center">
            No providers found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {providers.map((provider) => (
              <ProviderCard
                key={provider._id}
                id={provider._id}
                name={provider.name}
                speciality={provider.speciality}
                hourlyPrice={provider.hourlyPrice}
                city={provider.city}
                avatar={provider.avatar}
                address="" 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
