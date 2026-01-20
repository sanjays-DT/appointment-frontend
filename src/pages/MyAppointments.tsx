import React, { useEffect, useState } from "react"
import api from "../api/axios.ts"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  CalendarIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { baseURL } from "../api/axios.ts"

interface Appointment {
  _id: string
  providerId: {
    _id: string
    name: string
    speciality?: string
  }
  start: string
  end: string
  status: string
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<{ [key: string]: string }>({})

  const isActionAllowed = (status: string) =>
    status === "pending" || status === "missed"

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return now.toISOString().slice(0, 16)
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/appointment/me")
        setAppointments(res.data.appointments)
      } catch {
        toast.error("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const handleCancel = async (id: string) => {
    if (!window.confirm("Do you want to cancel this appointment?")) return
    try {
      await api.put(`/appointment/${id}/cancel`, {})
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: "cancelled" } : appt
        )
      )
      toast.success("Appointment cancelled")
    } catch {
      toast.error("Failed to cancel appointment")
    }
  }

  const handleReschedule = async (appt: Appointment) => {
    const newStart = selectedSlot[appt._id]
    if (!newStart) {
      toast.error("Please select a new date and time")
      return
    }
    const selectedDate = new Date(newStart)
    const minAllowed = new Date(Date.now() + 30 * 60 * 1000)
    if (selectedDate < minAllowed) {
      toast.error("Please select a time at least 30 minutes from now")
      return
    }
    if (!window.confirm("Do you want to reschedule this appointment?")) return
    try {
      const newEnd = new Date(selectedDate.getTime() + 60 * 60 * 1000)
      await api.put(`/appointment/${appt._id}/reschedule`, {
        start: selectedDate,
        end: newEnd,
      })
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
      )
      toast.success("Appointment rescheduled")
    } catch {
      toast.error("Failed to reschedule")
    }
  }

  if (loading)
    return (
      <p className="text-center mt-10 text-muted-light dark:text-muted-dark">
        Loading appointments...
      </p>
    )

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-6 px-4 transition-theme">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-8">
          My Appointments
        </h1>

        {appointments.length === 0 ? (
          <div
            className="
              bg-surface-light dark:bg-surface-dark
              p-6 rounded-xl shadow
              text-center text-muted-light dark:text-muted-dark
              flex flex-col items-center gap-3
              border border-border-light dark:border-border-dark
              transition-theme
            "
          >
            <UserIcon className="w-12 h-12 opacity-60" />
            You have no appointments yet
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => {
              const startDate = new Date(appt.start)
              const endDate = new Date(appt.end)

              const statusStyles: { [key: string]: string } = {
                approved:
                  "border-l-green-500 bg-green-50 dark:bg-green-900/20",
                pending:
                  "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
                missed:
                  "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20",
                cancelled:
                  "border-l-red-500 bg-red-50 dark:bg-red-900/20",
                rejected:
                  "border-l-gray-400 bg-gray-100 dark:bg-gray-800",
              }

              return (
                <div
                  key={appt._id}
                  className={`
                    bg-surface-light dark:bg-surface-dark
                    border-l-4 ${statusStyles[appt.status]}
                    rounded-2xl shadow-md hover:shadow-xl
                    transition-theme p-4 flex flex-col justify-between
                  `}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    {appt.providerId._id ? (
                      <img
                        src={`${baseURL}/providers/${appt.providerId._id}/avatar`}
                        alt={appt.providerId.name}
                        className="w-10 h-10 rounded-full object-cover border border-border-light dark:border-border-dark"
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-muted-light dark:text-muted-dark" />
                    )}

                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-text-light dark:text-text-dark">
                        {appt.providerId.name}
                      </h2>
                      <p className="text-xs text-muted-light dark:text-muted-dark">
                        {appt.providerId.speciality || "No speciality"}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-text-light dark:text-text-dark">
                      {appt.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="mb-3 flex flex-col gap-1 text-xs text-muted-light dark:text-muted-dark">
                    <p className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 opacity-70" />
                      {startDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3 opacity-70" />
                      {startDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {appt.status === "missed" && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                      Missed by admin. Please reschedule.
                    </p>
                  )}

                  {/* Reschedule Input */}
                  <input
                    type="datetime-local"
                    min={getMinDateTime()}
                    value={selectedSlot[appt._id] || ""}
                    onChange={(e) =>
                      setSelectedSlot((prev) => ({
                        ...prev,
                        [appt._id]: e.target.value,
                      }))
                    }
                    className="
                      mb-3 w-full rounded-lg p-2 text-xs
                      bg-background-light dark:bg-background-dark
                      border border-border-light dark:border-border-dark
                      text-text-light dark:text-text-dark
                      focus:ring-2 focus:ring-primary focus:outline-none
                      transition-theme
                    "
                  />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReschedule(appt)}
                      disabled={!isActionAllowed(appt.status)}
                      className={`
                        flex-1 flex items-center justify-center gap-1 py-2 rounded-lg
                        font-medium text-white text-xs transition
                        ${
                          !isActionAllowed(appt.status)
                            ? "bg-gray-400 cursor-not-allowed opacity-50"
                            : "bg-primary hover:opacity-90"
                        }
                      `}
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reschedule
                    </button>

                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={!isActionAllowed(appt.status)}
                      className={`
                        flex-1 flex items-center justify-center gap-1 py-2 rounded-lg
                        font-medium text-white text-xs transition
                        ${
                          !isActionAllowed(appt.status)
                            ? "bg-gray-400 cursor-not-allowed opacity-50"
                            : "bg-danger hover:opacity-90"
                        }
                      `}
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyAppointments
