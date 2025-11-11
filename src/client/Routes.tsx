import { BrowserRouter, Routes, Route } from "react-router";
import AuthedApp from "./AuthedApp";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Weave from "./pages/Weave";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthedApp />}>
          <Route index element={<Home />} />
          <Route path="/weaves/:id" element={<Weave />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
