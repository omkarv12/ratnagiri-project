import React, { useState } from "react";

import LocationForm from "./LocationForm";
import HomestayForm from "./HomestayForm";
import DriverForm from "./DriverForm";

export default function RegistrationForm({ onSuccess }) {

    const [formType, setFormType] = useState("location");

    return (

        <div className="space-y-6">

            <div>

                <label className="block text-xs font-bold text-slate-500 mb-1">
                    Choose Registration Type
                </label>

                <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-orange-500"
                >

                    <option value="location">
                        Location
                    </option>

                    <option value="homestay">
                        Homestay
                    </option>

                    <option value="driver">
                        Autorickshaw / Taxi Driver
                    </option>

                </select>

            </div>

            {formType === "location" && (

                <LocationForm onSuccess={onSuccess} />

            )}

            {formType === "homestay" && (

                <HomestayForm onSuccess={onSuccess} />

            )}

            {formType === "driver" && (

                <DriverForm onSuccess={onSuccess} />

            )}

            

        </div>

    );

}