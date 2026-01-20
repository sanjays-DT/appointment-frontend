import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Navbar from "./components/Navbar.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DarkModeProvider } from "./context/DarkModeContext.tsx";

import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Categories from "./pages/Categories.tsx";
import Providers from "./pages/Providers.tsx";
import ProviderDetails from "./pages/ProviderDetails.tsx";
import BookAppointment from "./pages/BookAppointment.tsx";
import MyAppointments from "./pages/MyAppointments.tsx";
import Profile from "./pages/Profile.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";

export default function App() {
  return (
    <Router>
       <DarkModeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />

            <Route
              path="/providers/:categoryId"
              element={
                <ProtectedRoute>
                  <Providers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/provider/:providerId"
              element={
                <ProtectedRoute>
                  <ProviderDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book/:providerId"
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Login />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
      </DarkModeProvider>
    </Router>
  );
}
