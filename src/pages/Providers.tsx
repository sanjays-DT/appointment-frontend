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
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-theme">
      {/* ===== Hero Section ===== */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Available Providers
          </h1>
          <p className="text-indigo-100 mt-3 max-w-xl">
            Browse professionals offering services in this category
          </p>
        </div>
      </div>

      {/* ===== Providers Grid ===== */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {providers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold text-text-light dark:text-text-dark">
              No providers found
            </p>
            <p className="text-muted-light dark:text-muted-dark mt-2">
              Please check back later or explore another category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {providers.map((provider) => (
              <ProviderCard
                key={provider._id}
                id={provider._id}
                name={provider.name}
                speciality={provider.speciality}
                hourlyPrice={provider.hourlyPrice}
                city={provider.city}
                avatar={`${process.env.REACT_APP_API_URL}/providers/${provider._id}/avatar`}
                address=""
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
