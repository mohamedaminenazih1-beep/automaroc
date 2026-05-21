import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import SignUp from "../pages/signup/page";
import Login from "../pages/login/page";
import Catalogue from "../pages/catalogue/page";
import AdminDashboard from "../pages/admin/page";
import ManagerDashboard from "../pages/manager/page";
import CarDetail from "../pages/car/page";
import CartPage from "../pages/cart/page";
import HistoryPage from "../pages/history/page";
import NotificationsPage from "../pages/notifications/page";
import ProfilePage from "../pages/profile/page";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <Login /> },
  { path: "/catalogue", element: <Catalogue /> },
  { path: "/car/:id", element: <CarDetail /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/history", element: <HistoryPage /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/manager", element: <ManagerDashboard /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
