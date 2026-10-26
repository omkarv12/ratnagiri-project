
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
import PlanYourTrip from "./pages/PlanYourTrip";
import Places from "./pages/Places";
import NatureWalks from "./pages/NatureWalks";
import TraditionalFood from "./pages/TraditionalFood";
import CulturalEvents from "./pages/CulturalEvents";
import CommunityExperience from "./pages/CommunityExperience";
import Stories from "./pages/Stories";
import TransportFacilities from "./pages/TransportFacilities";
import ReelAwards from "./pages/ReelAwards";
import StoryDetail from "./pages/StoryDetail";
import UpcomingEventsPage from "./pages/UpcomingEventsPage";
import DiscoverYourStay from "./pages/DiscoverYourStay";
import HiddenPaths from "./pages/HiddenPaths";
import SubmitHiddenPath from "./pages/SubmitHiddenPath";
import ExperiencePage from "./pages/ExperiencePage";
import ExploreVillages from "./pages/ExploreVillages";
import ExploreVillageDetail from "./pages/ExploreVillageDetail";

// Itineraries
import Itineraries from "./pages/Itineraries";
import ItineraryDetail from "./pages/ItineraryDetail";

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
          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Application pages */}
          <Route element={<DashboardLayout />}>
            <Route
              path="/registration"
              element={<Registration />}
            />

            <Route
              path="/dashboard"
              element={<DashboardOverview />}
            />

            {/* About → Geography → Places */}
            <Route
              path="/about/geography/places"
              element={<Places />}
            />

            {/* Experiences → Upcoming Events */}
            <Route
              path="/experiences/upcoming-events"
              element={<UpcomingEventsPage />}
            />

            {/* Experiences → Discover Your Stay */}
            <Route
              path="/experiences/discover-your-stay"
              element={<DiscoverYourStay />}
            />

            {/* Experiences → Hidden Paths */}
            <Route
              path="/experiences/hidden-paths"
              element={<HiddenPaths />}
            />

            <Route
              path="/experiences/hidden-paths/submit"
              element={<SubmitHiddenPath />}
            />

            {/* Experiences → Explore Villages */}
            <Route
              path="/experiences/explore-villages"
              element={<ExploreVillages />}
            />

            <Route
              path="/experiences/explore-villages/:taluka/:village"
              element={<ExploreVillageDetail />}
            />

            {/* Experiences → Itineraries */}
            <Route
              path="/experiences/itineraries"
              element={<Itineraries />}
            />

            {/* Individual itinerary with day-by-day details */}
            <Route
              path="/experiences/itineraries/:slug"
              element={<ItineraryDetail />}
            />

            {/* Local Experiences */}
            <Route
              path="/experiences/guided-walks"
              element={<ExperiencePage category="guided-walks" />}
            />

            <Route
              path="/experiences/konkani-food"
              element={<ExperiencePage category="konkani-food" />}
            />

            <Route
              path="/experiences/community-interaction"
              element={<ExperiencePage category="community-interaction" />}
            />

            {/* Plan Your Trip */}
            <Route
              path="/plan-your-trip"
              element={<PlanYourTrip />}
            />

            {/* Tourist Rules */}
            <Route
              path="/rules"
              element={<RulesForTourists />}
            />

            <Route
              path="/resources/dos-and-donts"
              element={<RulesForTourists />}
            />

            {/* Location Profiles */}
            <Route
              path="/profile/:type/:id"
              element={<LocationProfile />}
            />

            {/* Villages */}
            <Route
              path="/villages"
              element={<VillagesTaluka />}
            />

            <Route
              path="/villages/:taluka"
              element={<VillageList />}
            />

            <Route
              path="/villages/:taluka/:village"
              element={<VillageDetail />}
            />

            {/* Sustainability Map */}
            <Route
              path="/map"
              element={<SustainabilityMap />}
            />

            {/* Nature and Culture */}
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
              path="/society"
              element={<Society />}
            />

            <Route
              path="/economy"
              element={<Economy />}
            />

            <Route
              path="/about/culture"
              element={<Culture />}
            />

            <Route
              path="/culture"
              element={<Culture />}
            />

            <Route
              path="/good-governance"
              element={<GoodGovernance />}
            />

            {/* Medical and Police Facilities */}
            <Route
              path="/medical-facilities"
              element={<MedicalFacilities />}
            />

            <Route
              path="/police-stations"
              element={<PoliceStations />}
            />

            {/* Resources → Transport Facilities */}
            <Route
              path="/resources/transport-facilities"
              element={<TransportFacilities />}
            />

            {/* Stories */}
            <Route
              path="/stories"
              element={<Stories />}
            />

            <Route
              path="/stories/reels"
              element={<ReelAwards />}
            />

            <Route
              path="/stories/:slug"
              element={<StoryDetail />}
            />

            {/* Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Videos */}
            <Route
              path="/videos"
              element={<Videos />}
            />
          </Route>
        </Routes>
      </Router>
    </LocationsProvider>
  );
}