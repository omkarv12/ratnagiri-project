import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <GoogleOAuthProvider
    clientId="115345881365-6h9fghgg0gf2pohug60sqfoclult7lqv.apps.googleusercontent.com"
>

    <AuthProvider>

        <App />

    </AuthProvider>

</GoogleOAuthProvider>

    </StrictMode>

);




