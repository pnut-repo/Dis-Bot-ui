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
          colorPrimary: "#6366f1",
          colorBackground: "#1e293b",
          colorText: "#f1f5f9",
          colorInputBackground: "#0f172a",
          colorInputText: "#f1f5f9",
          borderRadius: "0.75rem",
        },
        elements: {
          card: { backgroundColor: "#1e293b", border: "1px solid #334155" },
          formButtonPrimary: {
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            color: "#f1f5f9",
          },
          footerActionLink: { color: "#6366f1" },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
