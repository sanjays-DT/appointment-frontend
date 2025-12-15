import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Navbar from "./components/Navbar.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Categories from "./pages/Categories.tsx";
import Providers from "./pages/Providers.tsx";
import ProviderDetails from "./pages/ProviderDetails.tsx";
import BookAppointment from "./pages/BookAppointment.tsx";
import MyAppointments from "./pages/MyAppointments.tsx";

export default function App() {
  return (
    <>
    <Router>
      <NotificationProvider>
      <AuthProvider>
        <Navbar />
         <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route path="*" element={<Login />} />
        </Routes>
      </AuthProvider>
      </NotificationProvider>
    </Router>
    </>
  );
}
