import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardOverview from "./pages/DashboardOverview";
import LocationProfile from "./pages/LocationProfile";
import SustainabilityMap from "./pages/SustainabilityMap";
import AdminDashboard from "./pages/AdminDashboard";

import NatureWalks from "./pages/NatureWalks";
import TraditionalFood from "./pages/TraditionalFood";
import CulturalEvents from "./pages/CulturalEvents";
import CommunityExperience from "./pages/CommunityExperience";

import ProtectedRoute from "./components/ProtectedRoute";

import { LocationsProvider } from "./context/LocationsContext";
import Registration from "./pages/Registration";

export default function App() {
  return (
    <LocationsProvider>
      <Router>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route element={<DashboardLayout />}>

            <Route
              path="/registration"
              element={<Registration />}
            />

            <Route
              path="/dashboard"
              element={<DashboardOverview />}
            />

            <Route
              path="/profile/:id"
              element={<LocationProfile />}
            />

            <Route
              path="/map"
              element={<SustainabilityMap />}
            />

            <Route
              path="/nature-walks"
              element={<NatureWalks />}
            />

            <Route
              path="/traditional-food"
              element={<TraditionalFood />}
            />

            <Route
              path="/cultural-events"
              element={<CulturalEvents />}
            />

            <Route
              path="/community-experience"
              element={<CommunityExperience />}
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

          </Route>

        </Routes>
      </Router>
    </LocationsProvider>
  );
}