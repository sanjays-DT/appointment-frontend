import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.ts";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

interface Provider {
  _id: string;
  name: string;
}

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await api.get<Provider>(`/providers/${providerId}`);
        setProvider(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch provider details");
      }
    };
    fetchProvider();
  }, [providerId]);

  const book = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, 0, 0);

    try {
      await api.post("/appointment", {
        providerId,
        start: newDateTime.toISOString(),
        end: new Date(newDateTime.getTime() + 60 * 60 * 1000).toISOString(),
      });

      toast.success("Appointment booked successfully! 🎉");
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Selected time is already booked. Choose another time.");
      } else {
        toast.error("Failed to book appointment. Try again.");
        console.error(err);
      }
    }
  };

  if (!provider) return <p className="text-center mt-6 text-gray-700 text-sm">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-md shadow-md p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Book Appointment with {provider.name}
        </h1>

        {/* Form Fields with vertical spacing */}
        <div className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Book Button */}
          <button
            onClick={book}
            className="w-full py-3 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition"
          >
            Book Appointment
          </button>
        </div>

        {/* Selected Date/Time Display */}
        <p className="mt-4 text-gray-600 text-center text-sm">
          Selected:{" "}
          {new Date(`${date}T${time}`).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
            hour12: true,
          })}
        </p>
      </div>
    </div>
  );
}
