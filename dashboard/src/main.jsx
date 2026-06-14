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
          colorPrimary: "#f59e0b",
          colorBackground: "#22223a",
          colorText: "#e8e6f0",
          colorInputBackground: "#16162a",
          colorInputText: "#e8e6f0",
          borderRadius: "0.6rem",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
