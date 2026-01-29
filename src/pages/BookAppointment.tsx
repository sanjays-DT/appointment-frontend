'use client';

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar } from "lucide-react";

interface Slot {
  time: string;
  isBooked: boolean;
}

interface Provider {
  _id: string;
  name: string;
}

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const today = new Date().toISOString().split("T")[0];

  const [provider, setProvider] = useState<Provider | null>(null);
  const [date, setDate] = useState<string>(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Fetch provider info
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

  // Fetch slots for selected date
  useEffect(() => {
    if (!date) return;

    const fetchSlots = async () => {
      try {
        const res = await api.get(`/appointment/${providerId}/slots?date=${date}`);
        setSlots(Array.isArray(res.data.slots) ? res.data.slots : []);
        setSelectedSlot(""); // reset selection on date change
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch slots");
        setSlots([]);
      }
    };
    fetchSlots();
  }, [providerId, date]);

  // Book the selected slot
  const bookSlot = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    try {
      await api.post("/appointment/book-slot", {
        providerId,
        day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
        date,
        slotTime: selectedSlot,
      });

      toast.success("Slot booked successfully 🎉");

      // Mark slot as booked in UI
      setSlots((prev) =>
        prev.map((s) =>
          s.time === selectedSlot ? { ...s, isBooked: true } : s
        )
      );

      setSelectedSlot("");
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.msg || "Slot not available");
      } else {
        toast.error("Failed to book slot");
        console.error(err);
      }
    }
  };

  if (!provider) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark transition-theme">
        <p className="text-muted-light dark:text-muted-dark">
          Loading booking page...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-theme">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Book Appointment
          </h1>
          <p className="text-green-100 mt-2">
            with <span className="font-semibold">{provider.name}</span>
          </p>
        </div>
      </div>

      {/* ===== Booking Card ===== */}
      <div className="max-w-md mx-auto px-6 -mt-10">
        <div
          className="
            bg-surface-light dark:bg-surface-dark
            rounded-2xl shadow-lg p-6 space-y-5
            border border-border-light dark:border-border-dark
            transition-theme
          "
        >
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Select Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
                size={18}
              />
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 rounded-lg
                  bg-background-light dark:bg-background-dark
                  border border-border-light dark:border-border-dark
                  text-text-light dark:text-text-dark
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-theme
                "
              />
            </div>
          </div>

          {/* Slots Grid */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Available Slots
            </label>
            {slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={slot.isBooked}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-2 rounded-lg text-sm font-medium transition
                      ${slot.isBooked
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50 line-through"
                        : selectedSlot === slot.time
                          ? "bg-primary text-white"
                          : "bg-green-50 dark:bg-emerald-900/20"
                      }
`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-light dark:text-muted-dark">
                No available slots for this date
              </p>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={bookSlot}
            disabled={!selectedSlot}
            className="
              w-full py-3 rounded-xl
              bg-primary hover:opacity-90 disabled:opacity-50
              text-white font-semibold
              transition shadow-md
            "
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
