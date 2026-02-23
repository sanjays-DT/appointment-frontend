import React, { useEffect, useMemo, useState } from "react"
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
  providerId:
  | {
    _id: string
    name: string
    speciality?: string
  }
  | string
  start: string
  end: string
  status: string
}

interface RescheduleSlot {
  time: string
  isBooked: boolean
  status?: string
}

type FilterType = "all" | "upcoming" | "past" | "cancelled" | "missed"

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("")
  const [rescheduleSlots, setRescheduleSlots] = useState<RescheduleSlot[]>([])

  const isActionAllowed = (status: string) =>
    status === "pending" || status === "missed"

  const getMinDate = () => new Date().toLocaleDateString("en-CA")

  const isPastRescheduleSlot = (slotTime: string, date: string) => {
    if (!date) return false
    const today = new Date().toLocaleDateString("en-CA")
    if (date !== today) return false

    const startTime = slotTime.split(" - ")[0]
    const [hours, minutes] = startTime.split(":").map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return false

    const slotDateTime = new Date()
    slotDateTime.setHours(hours, minutes, 0, 0)

    return slotDateTime <= new Date()
  }

  const filteredAppointments = useMemo(() => {
    const now = new Date()
    return appointments.filter((appt) => {
      const end = new Date(appt.end)

      switch (filter) {
        case "upcoming":
          return end >= now && appt.status !== "cancelled"
        case "past":
          return end < now && appt.status !== "cancelled"
        case "cancelled":
          return appt.status === "cancelled"
        case "missed":
          return appt.status === "missed"
        default:
          return true
      }
    })
  }, [appointments, filter])

  const fetchRescheduleSlots = async (providerId: string, date: string) => {
    try {
      const formattedDate = new Date(date).toISOString().split("T")[0]

      const res = await api.get(`/providers/${providerId}/availability`, {
        params: { date: formattedDate },
      })

      if (!res.data || !Array.isArray(res.data.slots)) {
        setRescheduleSlots([])
        return
      }

      const normalizedSlots = res.data.slots.map((slot: any) => ({
        time: slot.time,
        isBooked: slot.isBooked || (slot.isAvailable === false)
      }));


      setRescheduleSlots(normalizedSlots)
    } catch (err: any) {
      console.error("Reschedule fetch error:", err?.response?.data || err)
      setRescheduleSlots([])
    }
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

  useEffect(() => {
    if (!rescheduleId || !rescheduleDate) return
    const appt = appointments.find((a) => a._id === rescheduleId)
    const providerIdValue =typeof appt?.providerId === "object"? appt.providerId._id : undefined
    if (!providerIdValue) return
    fetchRescheduleSlots(providerIdValue, rescheduleDate)
  }, [appointments, rescheduleDate, rescheduleId])

  const handleRescheduleSave = async (appt: Appointment) => {
    if (!rescheduleDate || !selectedRescheduleSlot) {
      toast.error("Pick a date and slot")
      return
    }

    const [startStr, endStr] = selectedRescheduleSlot.split(" - ")
    const start = new Date(`${rescheduleDate}T${startStr}:00`)
    const end = new Date(`${rescheduleDate}T${endStr}:00`)

    if (start < new Date()) {
      toast.error("Cannot reschedule to past slot")
      return
    }

    if (!window.confirm("Reschedule to selected slot?")) return

    try {
      const payload: any = {
        start: start.toISOString(),
        end: end.toISOString(),
        date: rescheduleDate,
        slotTime: selectedRescheduleSlot,
      }

      const providerIdValue =
        typeof appt.providerId === "string"
          ? appt.providerId
          : appt.providerId?._id
      if (providerIdValue && /^[a-f\d]{24}$/i.test(providerIdValue)) {
        payload.providerId = providerIdValue
      }

      await api.put(`/appointment/${appt._id}/reschedule`, payload)

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appt._id
            ? { ...a, start: start.toISOString(), end: end.toISOString() }
            : a
        )
      )

      toast.success("Rescheduled successfully")
      setRescheduleId(null)
      setRescheduleDate("")
      setSelectedRescheduleSlot("")
      setRescheduleSlots([])
    } catch (err: any) {
      const responseData = err?.response?.data
      console.error("Reschedule error:", {
        status: err?.response?.status,
        data: responseData,
        message: err?.message,
      })
      const message =
        responseData?.message ||
        responseData?.error ||
        err?.message ||
        "Failed to reschedule"
      toast.error(message)
    }
  }

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

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {["all", "upcoming", "past", "missed", "cancelled"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as FilterType)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                filter === type
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {filteredAppointments.length === 0 ? (
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
            {filteredAppointments.map((appt) => {
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
                      {(appt.providerId as any)._id ? (
                      <img
                        src={`${baseURL}/providers/${(appt.providerId as any)._id}/avatar`}
                        alt={(appt.providerId as any).name}
                        className="w-10 h-10 rounded-full object-cover border border-border-light dark:border-border-dark"
                      />
                    ) : (
                      <UserIcon className="w-10 h-10 text-muted-light dark:text-muted-dark" />
                    )}

                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-text-light dark:text-text-dark">
                        {(appt.providerId as any).name}
                      </h2>
                      <p className="text-xs text-muted-light dark:text-muted-dark">
                        {(appt.providerId as any).speciality || "No speciality"}
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
                      Missed by Provider. Please reschedule.
                    </p>
                  )}

                  {rescheduleId === appt._id && (
                    <div className="mb-3 space-y-2">
                      <label className="block text-xs font-medium text-text-light dark:text-text-dark">
                        Select Date
                      </label>
                      <input
                        type="date"
                        min={getMinDate()}
                        value={rescheduleDate}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value)
                          setSelectedRescheduleSlot("")
                        }}
                        className="
                          w-full rounded-lg p-2 text-xs
                          bg-background-light dark:bg-background-dark
                          border border-border-light dark:border-border-dark
                          text-text-light dark:text-text-dark
                          focus:ring-2 focus:ring-primary focus:outline-none
                          transition-theme
                        "
                      />

                      <label className="block text-xs font-medium text-text-light dark:text-text-dark">
                        Select Slot
                      </label>
                      {rescheduleSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {rescheduleSlots.map((slot) => {
                            const normalizedStatus = String(
                              slot.status ?? ""
                            ).toLowerCase()
                            const isBlockedStatus =
                              normalizedStatus === "completed" ||
                              normalizedStatus === "rescheduled" ||
                              normalizedStatus === "pending"
                            const isPastSlot = isPastRescheduleSlot(
                              slot.time,
                              rescheduleDate
                            )
                            const disabled =
                              slot.isBooked || isBlockedStatus || isPastSlot
                            return (
                              <button
                                key={slot.time}
                                disabled={disabled}
                                onClick={() => {
                                  if (!disabled) {
                                    setSelectedRescheduleSlot(slot.time)
                                  }
                                }}
                                className={`py-2 rounded-lg text-[11px] font-medium transition
                                  ${disabled
                                    ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50 line-through"
                                    : selectedRescheduleSlot === slot.time
                                      ? "bg-primary text-white"
                                      : "bg-green-50 dark:bg-emerald-900/20"
                                  }
                                `}
                              >
                                {slot.time}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-light dark:text-muted-dark">
                          No available slots for this date
                        </p>
                      )}

                      <button
                        onClick={() => handleRescheduleSave(appt)}
                        disabled={!selectedRescheduleSlot}
                        className="
                          w-full py-2 rounded-lg
                          bg-primary hover:opacity-90 disabled:opacity-50
                          text-white text-xs font-semibold
                          transition
                        "
                      >
                        Save Reschedule
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!isActionAllowed(appt.status)) return
                        if (rescheduleId === appt._id) {
                          setRescheduleId(null)
                          setRescheduleDate("")
                          setSelectedRescheduleSlot("")
                          setRescheduleSlots([])
                          return
                        }
                        setRescheduleId(appt._id)
                        setRescheduleDate(getMinDate())
                        setSelectedRescheduleSlot("")
                        setRescheduleSlots([])
                      }}
                      disabled={!isActionAllowed(appt.status)}
                      className={`
                        flex-1 flex items-center justify-center gap-1 py-2 rounded-lg
                        font-medium text-white text-xs transition
                        ${!isActionAllowed(appt.status)
                          ? "bg-gray-400 cursor-not-allowed opacity-50"
                          : "bg-primary hover:opacity-90"
                        }
                      `}
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      {rescheduleId === appt._id ? "Close" : "Reschedule"}
                    </button>

                    <button
                      onClick={() => handleCancel(appt._id)}
                      disabled={!isActionAllowed(appt.status)}
                      className={`
                        flex-1 flex items-center justify-center gap-1 py-2 rounded-lg
                        font-medium text-white text-xs transition
                        ${!isActionAllowed(appt.status)
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
