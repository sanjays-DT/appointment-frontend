'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar } from "lucide-react";

interface Slot {
  time: string;
  isBooked: boolean;
  isAvailable?: boolean;
}

interface Provider {
  _id: string;
  name: string;
}

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();

  const today = new Date().toLocaleDateString("en-CA");

  const [provider, setProvider] = useState<Provider | null>(null);
  const [date, setDate] = useState<string>(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  /* =================================================
     Disable past slots (only for today)
  ================================================= */
  const isPastSlot = useCallback(
    (slotTime: string) => {
      if (date !== today) return false;

      const now = new Date();
      const startTime = slotTime.split(" - ")[0];
      const [hours, minutes] = startTime.split(":").map(Number);

      const slotDateTime = new Date();
      slotDateTime.setHours(hours, minutes, 0, 0);

      return slotDateTime <= now;
    },
    [date, today]
  );

  /* =========================
     Fetch Provider
  ========================= */
  useEffect(() => {
    if (!providerId) return;

    const fetchProvider = async () => {
      try {
        const res = await api.get(`/providers/${providerId}`);
        setProvider(res.data);
      } catch (error) {
        console.error("Provider fetch error:", error);
        toast.error("Failed to fetch provider details");
      }
    };

    fetchProvider();
  }, [providerId]);

  /* =========================
     Fetch Slots (Correct API)
  ========================= */
  useEffect(() => {
    if (!providerId || !date) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);

        const res = await api.get(
          `/providers/${providerId}/slots`,
          { params: { date } }
        );

        const backendSlots = Array.isArray(res.data.slots)
          ? res.data.slots
          : [];

        setSlots(backendSlots);
        setSelectedSlot("");

      } catch (error) {
        console.error("Slots fetch error:", error);
        toast.error("Failed to fetch slots");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [providerId, date]);

  /* =========================
     Book Slot
  ========================= */
  const bookSlot = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    try {
      await api.post("/appointment/book-slot", {
        providerId,
        date,
        slotTime: selectedSlot,
      });

      toast.success("Slot booked successfully 🎉");

      // Immediately disable that slot
      setSlots(prev =>
        prev.map(slot =>
          slot.time === selectedSlot
            ? { ...slot, isBooked: true }
            : slot
        )
      );

      setSelectedSlot("");

    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.msg || "Slot not available");
      } else if (error.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Failed to book slot");
        console.error("Booking error:", error);
      }

      // Always refetch after failure (important for race condition)
      try {
        const res = await api.get(
          `/providers/${providerId}/slots`,
          { params: { date } }
        );
        setSlots(res.data.slots || []);
      } catch { }
    }
  };

  /* =========================
     Loading Screen
  ========================= */
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
    <div className="h-[552px] bg-background-light dark:bg-background-dark transition-theme">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 py-14 px-6">
        <div className="max-w-xl mx-auto text-center relative -top-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white ">
            Book Appointment
          </h1>
          <p className="text-green-100 mt-2">
            with <span className="font-semibold">{provider.name}</span>
          </p>
        </div>
      </div>

      {/* Booking Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 relative -top-6">
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
                  w-100px pl-10 pr-4 py-2 rounded-lg
                  bg-background-light dark:bg-background-dark
                  border border-border-light dark:border-border-dark
                  text-text-light dark:text-text-dark
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-theme
                "
              />
            </div>
          </div>

          {/* Slots */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Available Slots
            </label>

            {loadingSlots ? (
              <p className="text-sm text-muted-light dark:text-muted-dark">
                Loading slots...
              </p>
            ) : slots.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {slots.map((slot) => {
                  // Disable if booked, past, or provider marked unavailable
                  const disabled =
                    slot.isBooked || isPastSlot(slot.time) || slot.isAvailable === false; // <-- changed

                  return (
                    <button
                      key={slot.time}
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) setSelectedSlot(slot.time);
                      }}
                      className={`py-2 rounded-lg text-sm font-medium transition
        ${slot.isBooked || isPastSlot(slot.time)
                          ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50 line-through"
                          : slot.isAvailable === false
                            ? "bg-yellow-500 text-white cursor-not-allowed" // <-- changed
                            : selectedSlot === slot.time
                              ? "bg-primary text-white"
                              : "bg-green-50 dark:bg-emerald-900/20"
                        }
      `}
                    >
                      {slot.time}
                    </button>
                  );
                })}
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
