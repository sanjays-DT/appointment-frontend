import React, { useEffect, useState } from "react";
import api from "../api/axios.ts";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Appointment {
  _id: string;
  providerId: {
    _id: string;
    name: string;
    speciality?: string;
  };
  start: string;
  end: string;
  status: string;
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ [key: string]: string }>({});

  const isActionAllowed = (status: string) =>
    status === "pending" || status === "missed";

  // ⏱️ Minimum selectable datetime = now + 30 minutes
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/appointment/me");
        setAppointments(res.data.appointments);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Do you want to cancel this appointment?")) return;

    try {
      await api.put(`/appointment/${id}/cancel`, {});
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: "cancelled" } : appt
        )
      );
      toast.success("Appointment cancelled successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to cancel appointment.");
    }
  };

  const handleReschedule = async (appt: Appointment) => {
    if (appt.status === "cancelled") {
      toast.error("Cancelled appointments cannot be rescheduled.");
      return;
    }

    const newStart = selectedSlot[appt._id];
    if (!newStart) {
      toast.error("Please select a new date/time");
      return;
    }

    const selectedDate = new Date(newStart);
    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 30 * 60 * 1000);

    if (selectedDate < minAllowedTime) {
      toast.error("Please select a time at least 30 minutes from now.");
      return;
    }

    if (!window.confirm("Do you want to reschedule this appointment?")) return;

    try {
      const newEnd = new Date(selectedDate.getTime() + 60 * 60 * 1000);

      await api.put(`/appointment/${appt._id}/reschedule`, {
        start: selectedDate,
        end: newEnd,
      });

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appt._id
            ? {
              ...a,
              start: selectedDate.toISOString(),
              end: newEnd.toISOString(),
            }
            : a
        )
      );

      toast.success("Appointment rescheduled successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule appointment.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-700 text-base">Loading...</p>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-3">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          My Appointments
        </h1>

        {appointments.length === 0 ? (
          <div className="text-center p-5 bg-white shadow rounded">
            <p className="text-gray-600 text-base">No appointments yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {appt.providerId?.name}
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  {appt.providerId?.speciality || "No speciality"}
                </p>

                <div className="text-gray-700 text-sm mb-2">
                  <p>
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(appt.start).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">End:</span>{" "}
                    {new Date(appt.end).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 
                    ${appt.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : appt.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : appt.status === "missed"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                >
                  {appt.status}
                </span>

                {appt.status === "missed" && (
                  <p className="text-xs text-orange-600 mb-2">
                    Admin missed this appointment. Please reschedule.
                  </p>
                )}
               
                <div className="flex flex-col mb-2">
                  <input
                    type="datetime-local"
                    min={getMinDateTime()}
                    className="border border-gray-300 rounded-lg p-1.5 text-sm"
                    value={selectedSlot[appt._id] || ""}
                    onChange={(e) =>
                      setSelectedSlot((prev) => ({
                        ...prev,
                        [appt._id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => handleReschedule(appt)}
                    disabled={!isActionAllowed(appt.status)}
                    className={`mt-2 py-1.5 rounded text-white text-sm transition ${!isActionAllowed(appt.status)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                      }`}
                  >
                    Reschedule
                  </button>
                </div>

                <button
                  onClick={() => handleCancel(appt._id)}
                  disabled={!isActionAllowed(appt.status)}
                  className={`mt-1 py-1.5 rounded text-white text-sm transition ${!isActionAllowed(appt.status)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
