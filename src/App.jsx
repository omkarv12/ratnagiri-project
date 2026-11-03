import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { LocationsProvider } from "./context/LocationsContext";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Shared components
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import HowDidYouHearModal from "./components/HowDidYouHearModal";

// Auth & core pages
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import DashboardOverview from "./pages/DashboardOverview";
import AdminDashboard from "./pages/AdminDashboard";

// About
import Places from "./pages/Places";
import Culture from "./pages/Culture";
import Society from "./pages/Society";
import Economy from "./pages/Economy";
import GoodGovernance from "./pages/GoodGovernance";

// Experiences
import UpcomingEventsPage from "./pages/UpcomingEventsPage";
import DiscoverYourStay from "./pages/DiscoverYourStay";
import HiddenPaths from "./pages/HiddenPaths";
import SubmitHiddenPath from "./pages/SubmitHiddenPath";
import ExploreVillages from "./pages/ExploreVillages";
import ExploreVillageDetail from "./pages/ExploreVillageDetail";
import Itineraries from "./pages/Itineraries";
import ItineraryDetail from "./pages/ItineraryDetail";
import CircuitsPage from "./pages/CircuitsPage";
import ExperiencePage from "./pages/ExperiencePage";

// Nature & culture
import NatureWalks from "./pages/NatureWalks";
import TraditionalFood from "./pages/TraditionalFood";
import CulturalEvents from "./pages/CulturalEvents";
import CommunityExperience from "./pages/CommunityExperience";

// Villages
import VillagesTaluka from "./pages/VillagesTaluka";
import VillageList from "./pages/VillageList";
import VillageDetail from "./pages/VillageDetail";

// Locations & map
import LocationProfile from "./pages/LocationProfile";
import SustainabilityMap from "./pages/SustainabilityMap";

// Plan & resources
import PlanYourTrip from "./pages/PlanYourTrip";
import RulesForTourists from "./pages/RulesForTourists";
import TransportFacilities from "./pages/TransportFacilities";
import MedicalFacilities from "./pages/MedicalFacilities";
import PoliceStations from "./pages/PoliceStations";

// Stories & media
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import ReelAwards from "./pages/ReelAwards";
import Videos from "./pages/Videos";

export default function App() {
  return (
    <LocationsProvider>
      <Router>
        <ScrollToTop />
        <HowDidYouHearModal />

        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Login (outside layout) */}
          <Route path="/login" element={<Login />} />

          {/* Application pages (inside layout) */}
          <Route element={<DashboardLayout />}>
            {/* Core */}
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/registration" element={<Registration />} />

            {/* About */}
            <Route path="/about/geography/places" element={<Places />} />
            <Route path="/about/culture" element={<Culture />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/society" element={<Society />} />
            <Route path="/economy" element={<Economy />} />
            <Route path="/good-governance" element={<GoodGovernance />} />

            {/* Experiences */}
            <Route path="/experiences/upcoming-events" element={<UpcomingEventsPage />} />
            <Route path="/experiences/discover-your-stay" element={<DiscoverYourStay />} />
            <Route path="/experiences/hidden-paths" element={<HiddenPaths />} />
            <Route path="/experiences/hidden-paths/submit" element={<SubmitHiddenPath />} />
            <Route path="/experiences/explore-villages" element={<ExploreVillages />} />
            <Route
              path="/experiences/explore-villages/:taluka/:village"
              element={<ExploreVillageDetail />}
            />

            {/* Experiences → Itineraries */}
            <Route path="/experiences/itineraries" element={<Itineraries />} />
            <Route path="/experiences/itineraries/:slug" element={<ItineraryDetail />} />

            {/* Experiences → Circuits */}
            <Route path="/experiences/circuits" element={<CircuitsPage />} />
            <Route path="/experiences/circuits/:slug" element={<CircuitsPage />} />

            {/* Experiences → Local experiences */}
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

            {/* Nature & culture */}
            <Route path="/nature-walks" element={<NatureWalks />} />
            <Route path="/traditional-food" element={<TraditionalFood />} />
            <Route path="/cultural-events" element={<CulturalEvents />} />
            <Route path="/community-experience" element={<CommunityExperience />} />

            {/* Villages */}
            <Route path="/villages" element={<VillagesTaluka />} />
            <Route path="/villages/:taluka" element={<VillageList />} />
            <Route path="/villages/:taluka/:village" element={<VillageDetail />} />

            {/* Location profiles & map */}
            <Route path="/profile/:type/:id" element={<LocationProfile />} />
            <Route path="/map" element={<SustainabilityMap />} />

            {/* Plan your trip & resources */}
            <Route path="/plan-your-trip" element={<PlanYourTrip />} />
            <Route path="/rules" element={<RulesForTourists />} />
            <Route path="/resources/dos-and-donts" element={<RulesForTourists />} />
            <Route path="/resources/transport-facilities" element={<TransportFacilities />} />
            <Route path="/medical-facilities" element={<MedicalFacilities />} />
            <Route path="/police-stations" element={<PoliceStations />} />

            {/* Stories & media */}
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/reels" element={<ReelAwards />} />
            <Route path="/stories/:slug" element={<StoryDetail />} />
            <Route path="/videos" element={<Videos />} />

            {/* Admin (protected) */}
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