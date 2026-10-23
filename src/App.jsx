import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import DashboardOverview from "./pages/DashboardOverview";
import LocationProfile from "./pages/LocationProfile";
import SustainabilityMap from "./pages/SustainabilityMap";
import AdminDashboard from "./pages/AdminDashboard";
import Society from "./pages/Society";
import Economy from "./pages/Economy";
import Culture from "./pages/Culture";
import GoodGovernance from "./pages/GoodGovernance";
import MedicalFacilities from "./pages/MedicalFacilities";
import PoliceStations from "./pages/PoliceStations";
import PlanYourTrip from "./pages/PlanYourTrip"; // Plan Your Trip (Plan for me + trip planner)

import NatureWalks from "./pages/NatureWalks";
import TraditionalFood from "./pages/TraditionalFood";
import CulturalEvents from "./pages/CulturalEvents";
import CommunityExperience from "./pages/CommunityExperience";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import UpcomingEventsPage from "./pages/UpcomingEventsPage"; // pictorial calendar page
import DiscoverYourStay from "./pages/DiscoverYourStay"; // NEW: Experiences → Discover Your Stay

import ProtectedRoute from "./components/ProtectedRoute";
import RulesForTourists from "./pages/RulesForTourists";

import { LocationsProvider } from "./context/LocationsContext";
import Registration from "./pages/Registration";
import Videos from "./pages/Videos";
import VillagesTaluka from "./pages/VillagesTaluka";
import VillageList from "./pages/VillageList";
import VillageDetail from "./pages/VillageDetail";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <LocationsProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />

          <Route path="/" element={<DashboardLayout />}>
            <Route path="/registration" element={<Registration />} />

            <Route path="/dashboard" element={<DashboardOverview />} />

            {/* Menu bar → Experiences → Upcoming Events */}
            <Route
              path="/experiences/upcoming-events"
              element={<UpcomingEventsPage />}
            />

            {/* NEW: Menu bar → Experiences → Discover Your Stay
                (also opened by the "Discover Your Stay" banner on the map) */}
            <Route
              path="/experiences/discover-your-stay"
              element={<DiscoverYourStay />}
            />

            {/* NEW: Menu bar → Plan Your Trip → Plan Your Trip
                (Interactive Map sub-item points to /map) */}
            <Route path="/plan-your-trip" element={<PlanYourTrip />} />

            <Route path="/rules" element={<RulesForTourists />} />
            <Route path="/resources/dos-and-donts" element={<RulesForTourists />} />

            <Route path="/profile/:type/:id" element={<LocationProfile />} />

            <Route path="/villages" element={<VillagesTaluka />} />
            <Route path="/villages/:taluka" element={<VillageList />} />
            <Route path="/villages/:taluka/:village" element={<VillageDetail />} />

            <Route path="/map" element={<SustainabilityMap />} />

            <Route path="/nature-walks" element={<NatureWalks />} />

            <Route path="/traditional-food" element={<TraditionalFood />} />

            <Route path="/cultural-events" element={<CulturalEvents />} />

            <Route path="/community-experience" element={<CommunityExperience />} />

            <Route path="/society" element={<Society />} />

            {/* Menu bar → About → About → Economy (this route was missing) */}
            <Route path="/economy" element={<Economy />} />

            <Route path="/about/culture" element={<Culture />} />

            <Route path="/culture" element={<Culture />} />

            <Route path="/good-governance" element={<GoodGovernance />} />

            <Route path="/medical-facilities" element={<MedicalFacilities />} />

            <Route path="/police-stations" element={<PoliceStations />} />

            <Route path="/stories" element={<Stories />} />

            <Route path="/stories/:slug" element={<StoryDetail />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/videos" element={<Videos />} />
          </Route>

        </Routes>
      </Router>
    </LocationsProvider>
  );
}