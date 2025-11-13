import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Health from "./pages/Health.jsx";
import NotFound from "./pages/NotFound.jsx";
import ArticleDetail from "./pages/ArticleDetail.jsx";
import Articles from "./pages/Articles.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import BestPractices from "./pages/BestPractices.jsx";
import BestPracticeDetail from "./pages/BestPracticeDetail.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "health", element: <Health /> },
      { path: "articles", element: <Articles /> },
      { path: "articles/:id", element: <ArticleDetail /> },
      { path: "best-practices", element: <BestPractices /> },
      { path: "best-practices/:id", element: <BestPracticeDetail /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "favorites", element: (
        <ProtectedRoute>
          <FavoritesPage />
        </ProtectedRoute>
      )},
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
