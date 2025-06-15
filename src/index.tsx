import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import theme from "./flowbite-theme";
import { Flowbite } from "flowbite-react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./pages";
import SignInPage from "./pages/authentication/sign-in";
import SignUpPage from "./pages/authentication/sign-up";
import EcommerceProductsPage from "./pages/e-commerce/products";
import UserListPage from "./pages/users/list";
import BillingPage from "./pages/billing/list";
import MeterDashboardPage from "./pages/meter";

const container = document.getElementById("root");

if (!container) {
  throw new Error("React root element doesn't exist!");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <Flowbite theme={{ theme }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} index />
          <Route path="/authentication/sign-in" element={<SignInPage />} />
          <Route path="/authentication/sign-up" element={<SignUpPage />} />
          <Route
            path="/e-commerce/products"
            element={<EcommerceProductsPage />}
          />
          <Route path="/users/list" element={<UserListPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/meter" element={<MeterDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </Flowbite>
  </StrictMode>
);
