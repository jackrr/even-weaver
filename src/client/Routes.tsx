import { BrowserRouter, Routes, Route } from "react-router";
import AuthedApp from "./AuthedApp";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthedApp />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
