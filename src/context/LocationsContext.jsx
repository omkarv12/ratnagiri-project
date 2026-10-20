import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from "../config";

const LocationsContext = createContext({
  locations: [],
  homestays: [],
  eco: [],
  drivers: [],
  busStops: [],
  atms: [],
  loading: true,
  error: null
});

// Helper to generate a random coordinate near Dapoli based on the ID
const generateDummyCoordinates = (id, offsetFactor = 1) => {
  const baseLat = 17.7554;
  const baseLng = 73.1923;
  const latOffset = (id * 0.015 * offsetFactor) % 0.05;
  const lngOffset = (id * 0.01 * offsetFactor) % 0.05;

  return {
    lat: baseLat + latOffset,
    lng: baseLng - lngOffset
  };
};

export const LocationsProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [eco, setEco] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [atms, setAtms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllData = useCallback(async () => {
    const fetchApi = async (url) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      const dashboardData = await fetchApi("/api/dashboard");

      const locData = dashboardData.locations || [];
      const homeData = dashboardData.homestays || [];
      const ecoData = dashboardData.eco || [];
      const driverData = dashboardData.drivers || [];
      const busStopData = dashboardData.bus_stops || [];
      const atmData = dashboardData.atms || [];

      const parsedLocations = locData.map((row) => ({
        ...row,
        id: row.id,
        // Old UI compatibility
        name: row.location_name || `Location ${row.id}`,
        village: row.village_name || row.located_in || "Unknown",
        taluka: row.taluka_name || "Unknown",
        district: row.district_name || "Ratnagiri",
        category: row.category || "Unknown",
        landmark: row.nearest_landmark || "Unknown",
        roadStatus: row.road_condition || "Unknown",
        signs: row.signboards_available || "Unknown",
        season: row.seasonal_availability || "Unknown",
        duration: row.avg_time_spent || "Unknown",
        mediaDriveUrl: row.photo_location || "#",
        lat: row.latitude,
        lng: row.longitude
      }));

      const parsedHomestays = homeData.map((row) => ({
        ...row,
        id: row.id,
        name: row.homestay_name || `Homestay ${row.id}`,
        owner: row.owner_name || "Unknown",
        phone: row.phone_number || "Unknown",
        village: row.village_town_city || "Unknown",
        taluka: row.taluka_name || "Unknown",
        type: row.homestay_type || "Homestay",
        amenities: row.facilities_services || "Basic",
        mediaDriveUrl: row.photo_homestay || "#",
        lat: row.latitude,
        lng: row.longitude
      }));

      const parsedEco = ecoData.map((row, index) => {
        const id = index + 200;
        const coords = generateDummyCoordinates(id, 3);
        return {
          id: id,
          name: `${row['Village/Town/City Name'] || 'Unknown'} Eco Hub`,
          village: row['Village/Town/City Name'] || 'Unknown',
          waste: row['Waste Management'] || 'Unknown',
          water: row['Drinking Water'] || 'Unknown',
          lat: coords.lat,
          lng: coords.lng
        };
      });

      const parsedDrivers = driverData.map((row) => ({
        ...row,
        id: row.id,
        name: row.driver_name || `Driver ${row.id}`,
        phone: row.phone_number || "Unknown",
        vehicleType: row.vehicle_type || "Unknown",
        vehicleNumber: row.vehicle_number || "Unknown",
        village: row.base_village || "Unknown",
        taluka: row.taluka_name || "Unknown",
        serviceArea: row.service_area || "Unknown",
        rate: row.per_day_rate || "Unknown",
        vehiclePhotos: row.vehicle_photos || "#",
        lat: row.latitude,
        lng: row.longitude,
      }));

      const parsedBusStops = busStopData.map((row) => ({
        ...row,
        id: row.id,
        name: row.stop_name || `Bus Stand ${row.id}`,
        taluka: row.taluka_name || "Unknown",
        district: row.district_name || "Ratnagiri",
        timetableLink: row.timetable_link || null,
        googleMapsLink: row.google_maps_link || null,
        lat: row.latitude,
        lng: row.longitude,
      }));

      const parsedAtms = atmData.map((row) => ({
        ...row,
        id: row.id,
        name: row.atm_name || `ATM ${row.id}`,
        bank: row.bank_name || "Unknown bank",
        village: row.village_name || "Unknown",
        taluka: row.taluka_name || "Unknown",
        district: row.district_name || "Ratnagiri",
        address: row.address || "",
        googleMapsLink: row.google_maps_link || null,
        is24x7: row.is_24x7 !== false,
        hasCashDeposit: !!row.has_cash_deposit,
        photoUrl: row.photo_url || null,
        lat: row.latitude,
        lng: row.longitude,
      }));

      setLocations(parsedLocations);
      setHomestays(parsedHomestays);
      setEco(parsedEco);
      setDrivers(parsedDrivers);
      setBusStops(parsedBusStops);
      setAtms(parsedAtms);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <LocationsContext.Provider
      value={{ locations, homestays, eco, drivers, busStops, atms, loading, error, reload: loadAllData }}
    >
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = () => useContext(LocationsContext);