import { useAuth } from "../context/AuthContext.jsx";

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>You are logged in as {user.email}</p>

      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  );
}

export default HomePage;
