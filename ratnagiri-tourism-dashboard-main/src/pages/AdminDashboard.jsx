import React, { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config";

export default function AdminDashboard() {

    const { user } = useAuth();
    const [pendingLocations, setPendingLocations] = useState([]);
    const [pendingHomestays, setPendingHomestays] = useState([]);
    const [loading, setLoading] = useState(true);

    // -------------------------------
    // Approve Location
    // -------------------------------
    const approveLocation = async (id) => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/pending_locations/${id}/approve`,
                {
                    method: "POST"
                }
            );

            const data = await response.json();

            setPendingLocations((prev) =>
                prev.filter((location) => location.id !== id)
            );

            alert(data.message);
        } catch (err) {

            console.error(err);

            alert("Approval failed.");

        }

    };

    const rejectLocation = async (id) => {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/pending_locations/${id}/reject`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        setPendingLocations((prev) =>
            prev.filter((location) => location.id !== id)
        );

        alert(data.message);

    } catch (err) {

        console.error(err);

        alert("Reject failed.");

    }

};

const approveHomestay = async (id) => {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/pending_homestays/${id}/approve`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        setPendingHomestays((prev) =>
            prev.filter((homestay) => homestay.id !== id)
        );

        alert(data.message);

    } catch (err) {

        console.error(err);

        alert("Approval failed.");

    }

};

const rejectHomestay = async (id) => {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/pending_homestays/${id}/reject`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        setPendingHomestays((prev) =>
            prev.filter((homestay) => homestay.id !== id)
        );

        alert(data.message);

    } catch (err) {

        console.error(err);

        alert("Reject failed.");

    }

};

    // -------------------------------
    // Load Pending Locations
    // -------------------------------
    useEffect(() => {

        const loadPending = async () => {

            try {

                const locationResponse = await fetch(
    `${API_BASE_URL}/api/pending_locations`
);

const homestayResponse = await fetch(
    `${API_BASE_URL}/api/pending_homestays`
);

const locationData = await locationResponse.json();

const homestayData = await homestayResponse.json();

console.log("Locations:", locationData);
console.log("Homestays:", homestayData);

setPendingLocations(locationData);

setPendingHomestays(homestayData);
            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);

            }

        };

        loadPending();

    }, []);

    return (

        <div className="min-h-screen bg-slate-100 p-8">

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Tourism Administration Panel
            </h1>

            <p className="text-slate-600 mb-8">
                Manage pending tourist locations, homestays and eco submissions.
            </p>

            <div className="bg-white rounded-xl shadow-md p-6">

                <h2 className="text-xl font-semibold mb-4">
                    Pending Submissions
                </h2>

                {loading ? (

                    <p className="text-slate-500">
                        Loading pending submissions...
                    </p>

                ) : pendingLocations.length === 0 && pendingHomestays.length === 0 ? (

                    <p className="text-slate-500">
                        No pending submissions found.
                    </p>

                ) : (

                    <div className="space-y-4">

                        {pendingLocations.map((location) => (

                            <div
                                key={location.id}
                                className="border rounded-lg p-4 bg-slate-50"
                            >
                                  <h3 className="font-bold text-lg">
             📍 Location
        </h3>
                                <p>
                                    <strong>Name:</strong> {location.location_name}
                                </p>

                                <p>
                                    <strong>Village:</strong> {location.located_in}
                                </p>

                                <p>
                                    <strong>Taluka:</strong> {location.taluka_name}
                                </p>

                                <p>
                                    <strong>Status:</strong> {location.status}
                                </p>

                                {user?.role === "admin" && (

    <div className="flex gap-3 mt-4">

        <button
            onClick={() => approveLocation(location.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
            Approve
        </button>

        <button
            onClick={() => rejectLocation(location.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
            Reject
        </button>

    </div>

)}

                            </div>

                        ))}

                    

            {pendingHomestays.map((homestay) => (

    <div
        key={homestay.id}
        className="border rounded-lg p-4 bg-slate-50 mt-4"
    >

        <h3 className="font-bold text-lg">
            🏠 Homestay
        </h3>

        <p>
            <strong>Name:</strong> {homestay.homestay_name}
        </p>

        <p>
            <strong>Owner:</strong> {homestay.owner_name}
        </p>

        <p>
            <strong>Village:</strong> {homestay.village_town_city}
        </p>

        <p>
            <strong>Status:</strong> {homestay.status}
        </p>

        {user?.role === "admin" && (

    <div className="flex gap-3 mt-4">

        <button
            onClick={() => approveHomestay(homestay.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
            Approve
        </button>

        <button
            onClick={() => rejectHomestay(homestay.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
            Reject
        </button>

    </div>

)}

    </div>

))}
                    </div>
                )}

            </div>

        </div>

    );

}