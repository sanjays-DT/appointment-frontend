'use client';

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, Clock } from "lucide-react";

interface Provider {
  _id: string;
  name: string;
}

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const today = new Date().toISOString().split("T")[0];

  const [provider, setProvider] = useState<Provider | null>(null);
  const [date, setDate] = useState<string>(today);
  const [time, setTime] = useState<string>("");

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
    const appointmentStart = new Date(date);
    appointmentStart.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (appointmentStart <= now) {
      toast.error("You cannot book an appointment in the past");
      return;
    }

    const cutoffTime = new Date(appointmentStart.getTime() - 30 * 60 * 1000);
    if (now > cutoffTime) {
      toast.error("You must book at least 30 minutes in advance");
      return;
    }

    try {
      await api.post("/appointment", {
        providerId,
        start: appointmentStart.toISOString(),
        end: new Date(appointmentStart.getTime() + 60 * 60 * 1000).toISOString(),
      });
      toast.success("Appointment booked successfully 🎉");
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Selected time is already booked");
      } else {
        toast.error("Failed to book appointment");
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

  const isToday = date === today;

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
          {/* Date */}
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

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Select Time
            </label>
            <div className="relative">
              <Clock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
                size={18}
              />
              <input
                type="time"
                value={time}
                min={isToday ? new Date().toTimeString().slice(0, 5) : undefined}
                onChange={(e) => setTime(e.target.value)}
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
            <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
              Must be booked at least 30 minutes before appointment
            </p>
          </div>

          {/* Confirm Button */}
          <button
            onClick={book}
            className="
              w-full py-3 rounded-xl
              bg-primary hover:opacity-90
              text-white font-semibold
              transition shadow-md
            "
          >
            Confirm Booking
          </button>

          {/* Preview */}
          {time && (
            <div
              className="
                mt-6 rounded-lg p-3 text-center
                bg-green-50 dark:bg-emerald-900/20
                border border-green-200 dark:border-emerald-700
                transition-theme
              "
            >
              <p className="text-sm text-green-600 dark:text-emerald-400">
                Selected slot
              </p>
              <p className="font-medium text-text-light dark:text-text-dark mt-1">
                {new Date(`${date}T${time}`).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
