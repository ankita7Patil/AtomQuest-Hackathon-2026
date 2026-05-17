import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";

function Shell() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
