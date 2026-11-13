import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/authContext";
import ConquistasProvider from "./context/ConquistasProvider";

import "./index.css";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ConquistasProvider>
                    <App />
                </ConquistasProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);