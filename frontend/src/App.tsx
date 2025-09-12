import { BrowserRouter,Routes, Route, Link } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { DashboardPage } from "./pages/DashboardPage"

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 p-4 text-white flex gap-4">
        <Link to="/login">Login</Link>
        <Link to="/register">Cadastro</Link>
        <Link to="/dashboard">Dashboard (Protegido)</Link>
      </nav>

      <div className="p-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<LoginPage /> } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
