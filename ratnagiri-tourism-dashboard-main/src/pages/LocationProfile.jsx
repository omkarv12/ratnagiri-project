import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from "react";
import { useLocations } from '../context/LocationsContext';
import ProfileDetails from './ProfileDetails';


export default function LocationProfile() {

  const { type, id } = useParams();
  const navigate = useNavigate();
  const { locations, homestays, eco, loading } = useLocations();
  const numericId = Number(id);

  const loc = useMemo(() => {
    const source = type === "homestay" ? homestays : type === "eco" ? eco : locations;
    return source.find(x => x.id === numericId) || null;
  }, [numericId, type, locations, homestays, eco]);

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse font-medium text-slate-500">
        Loading live database...
      </div>
    );
  }

  if (!loc) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold">Location Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  return <ProfileDetails loc={loc} type={type} onBack={() => navigate(-1)} />;
}