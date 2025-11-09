import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";

export default function ProfilePage(){
  const { user, loading, signInGoogle, signOutUser } = useAuth();
  const nav = useNavigate();
  return (
    <div className="bg-background-light min-h-screen font-display flex flex-col">
      <header className="top-0 z-10 flex items-center p-4 bg-[var(--bg)]/80 backdrop-blur border-b border-[var(--border)]">
        <button onClick={() => nav(-1)} className="h-10 w-10" aria-label="Back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">Profile</h1>
        <div className="h-10 w-10" />
      </header>

      <main className="grid grid-cols-1 p-4 pb-24 flex-1">
        {loading && <div>Loading…</div>}

        {!loading && !user && (
          <div className="card p-4">
            <p className="mb-3">Sign in to view your orders and save addresses.</p>
            <button onClick={signInGoogle} className="btn-primary w-full">Continue with Google</button>
          </div>
        )}

        {!loading && user && (
          <div className="space-y-4">
            <div className="card p-4 flex items-center gap-3">
              <Avatar
                src={user.photoURL}
                name={user.displayName}
                email={user.email}
                size={48}
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">{user.displayName || user.email}</p>
                <p className="text-sm text-[color:var(--text-secondary)] truncate">{user.email}</p>
              </div>
            </div>

            <Link to="/orders" className="card p-4 flex justify-between items-center">
              <span>My Orders</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>

            <Link to="/addresses" className="card p-4 flex justify-between items-center">
              <span>Saved Addresses</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </Link>

            <button
              onClick={signOutUser}
              className="w-full bg-primary-50 text-primary-700 font-bold rounded-xl py-3"
            >
              Sign out
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
