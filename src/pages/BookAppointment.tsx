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
  startUTC?: string;
  endUTC?: string;
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
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
     Fetch Slots from DB
  ========================= */
  const fetchSlotsFromDB = useCallback(async (showLoading = true) => {
    if (!providerId || !date) return;

    try {
      if (showLoading) setLoadingSlots(true);

      // Send date and timezone to backend
      const res = await api.get(
        `/providers/${providerId}/slots`,
        { 
          params: { 
            date,
            timezone: userTimezone, // Send user's timezone
            t: Date.now()
          } 
        }
      );

      console.log("Raw slots from DB:", res.data.slots);
      
      const backendSlots = Array.isArray(res.data.slots) ? res.data.slots : [];

      // The backend should return slots with isBooked flag properly set
      setSlots(backendSlots);
      setSelectedSlot("");

    } catch (error) {
      console.error("Slots fetch error:", error);
      toast.error("Failed to fetch slots");
      setSlots([]);
    } finally {
      if (showLoading) setLoadingSlots(false);
    }
  }, [providerId, date, userTimezone]);

  // Initial fetch
  useEffect(() => {
    fetchSlotsFromDB(true);
  }, [fetchSlotsFromDB]);

  /* =========================
     Book Slot - Send all required data
  ========================= */
  const bookSlot = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    // Find the selected slot to verify it's not already booked
    const selectedSlotData = slots.find(slot => slot.time === selectedSlot);
    if (selectedSlotData?.isBooked) {
      toast.error("This slot is already booked");
      return;
    }

    try {
      console.log("Booking slot:", {
        providerId,
        date,
        slotTime: selectedSlot,
        timezone: userTimezone
      });

      const response = await api.post("/appointment/book-slot", {
        providerId,
        date,
        slotTime: selectedSlot,
        timezone: userTimezone
      });

      console.log("Booking response:", response.data);
      toast.success("Slot booked successfully 🎉");

      // Immediately mark this slot as booked in the UI
      setSlots(prev =>
        prev.map(slot =>
          slot.time === selectedSlot
            ? { ...slot, isBooked: true, isAvailable: false }
            : slot
        )
      );

      setSelectedSlot("");

      // CRITICAL: Refetch from DB to ensure consistency
      // This will get the latest data from the database
      setTimeout(async () => {
        await fetchSlotsFromDB(false);
      }, 500);

    } catch (error: any) {
      console.error("Booking error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        const errorMsg = error.response.data.msg || error.response.data.message;
        
        if (errorMsg?.includes("already booked") || errorMsg?.includes("not available")) {
          
          toast.info("This slot was just booked by someone else", {
            autoClose: 3000,
          });
          
          // Refetch to get the latest state from DB
          await fetchSlotsFromDB(false);
          
        } else {
          toast.error(errorMsg || "Slot not available");
        }
      } else if (error.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Failed to book slot");
      }
      
      setSelectedSlot("");
    }
  };

  /* =========================
     Check if slot is disabled
  ========================= */
  const isSlotDisabled = useCallback((slot: Slot) => {
    return slot.isBooked || slot.isAvailable === false || isPastSlot(slot.time);
  }, [isPastSlot]);

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
    <div className="min-h-[552px] bg-background-light dark:bg-background-dark transition-theme">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Book Appointment
          </h1>
          <p className="text-green-100 text-2xl mt-2">
            with <span className="font-semibold">{provider.name}</span>
          </p>
          <p className="text-green-100 text-sm mt-1">
            All times shown in {userTimezone}
          </p>
        </div>
      </div>

      {/* Booking Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-10">
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
                  w-full md:w-auto pl-10 pr-4 py-2 rounded-lg
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {slots.map((slot) => {
                  const disabled = isSlotDisabled(slot);

                  return (
                    <button
                      key={slot.time}
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) setSelectedSlot(slot.time);
                      }}
                      className={`
                        py-2 px-1 rounded-lg text-sm font-medium transition relative
                        ${disabled
                          ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50 line-through text-gray-600 dark:text-gray-400"
                          : selectedSlot === slot.time
                            ? "bg-primary text-white"
                            : "bg-green-50 dark:bg-emerald-900/20 hover:bg-green-100 dark:hover:bg-emerald-800/30 text-text-light dark:text-text-dark"
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

          {/* Selected Slot Display */}
          {selectedSlot && (
            <div className="text-sm text-primary font-medium">
              Selected: {selectedSlot}
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={bookSlot}
            disabled={!selectedSlot}
            className="
              w-full py-3 rounded-xl
              bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
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