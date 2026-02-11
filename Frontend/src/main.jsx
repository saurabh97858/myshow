import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AppProvider } from "./context/AppContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// ✅ Properly wrap Clerk within Router context
function ClerkWithRouter({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}

import ScrollToTop from "./components/ScrollToTop";

function Main() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ClerkWithRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
