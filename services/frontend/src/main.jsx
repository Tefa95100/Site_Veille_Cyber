import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Health from "./pages/Health.jsx";
import NotFound from "./pages/NotFound.jsx";
import ArticleDetail from "./pages/ArticleDetail.jsx";
import Articles from "./pages/Articles.jsx";

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
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
