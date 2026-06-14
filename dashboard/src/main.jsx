import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables.");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#2563EB",
          colorBackground: "#FFFFFF",
          colorText: "#111827",
          colorInputBackground: "#F9FAFB",
          colorInputText: "#111827",
          borderRadius: "0.625rem",
        },
        elements: {
          card: {
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          },
          formButtonPrimary: {
            background: "#2563EB",
            boxShadow: "0 1px 3px rgba(37,99,235,0.30)",
          },
          footerActionLink: { color: "#2563EB" },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
