import rawLocations from './locations.csv';

// Helper to generate a random coordinate near Dapoli based on the ID 
// (Since the CSV only has unresolvable goo.gl links)
const generateDummyCoordinates = (id) => {
  const baseLat = 17.7554;
  const baseLng = 73.1923;
  // create some artificial spread based on ID
  const latOffset = (id * 0.015) % 0.05;
  const lngOffset = (id * 0.01) % 0.05;
  
  return {
    lat: baseLat + latOffset,
    lng: baseLng - lngOffset
  };
};

export const locations = rawLocations.map((row, index) => {
  const id = index + 1;
  const coords = generateDummyCoordinates(id);

  return {
    id: id,
    name: row['Name of Location'] || `Location ${id}`,
    category: row['What is the type of attraction ?'] || 'Unknown',
    landmark: row['Nearest Landmark'] || 'Unknown',
    village: row['Village name'] || row['Located in'] || 'Unknown',
    taluka: row['Taluka Name'] || 'Dapoli',
    district: row['District Name'] || 'Ratnagiri',
    roadStatus: row['Road condition'] || 'Unknown',
    signs: row['Signboards available'] || 'Unknown',
    season: row['Seasonal availability'] || 'Open all year',
    duration: row['Average time spent (Minutes/Hours)'] || 'Unknown',
    mediaDriveUrl: row['Upload photo of the location'] || '#',
    lat: coords.lat,
    lng: coords.lng
  };
});
