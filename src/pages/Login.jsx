import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

export default function Login() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/google`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential
                    })
                }
            );

            const data = await response.json();

            if (data.success) {

                login(data);

                alert(
                    `Welcome ${data.name}\nRole : ${data.role}`
                );

                navigate("/admin");

            } else {

                alert(data.error);

            }

        } catch (err) {

            console.error(err);

            alert("Login failed.");

        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="bg-white p-8 rounded-xl shadow-lg">

                <h1 className="text-2xl font-bold mb-6">

                    Login

                </h1>

                <GoogleLogin

                    onSuccess={handleSuccess}

                    onError={() => {

                        alert("Google Login Failed");

                    }}

                />

            </div>

        </div>

    );

}