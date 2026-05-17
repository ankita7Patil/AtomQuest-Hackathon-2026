import { useState } from "react";
import { BarChart3, KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-sm font-semibold text-moss">
            <ShieldCheck size={18} /> AtomQuest 2026 Submission
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">GoalTrack Portal</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A company-ready goal setting system with validation, manager approvals, quarterly check-ins, shared goals, audit logs, and exportable progress reports.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-soft"><UsersRound className="text-moss" /><p className="mt-3 font-semibold">3 roles</p></div>
            <div className="rounded-lg bg-white p-4 shadow-soft"><BarChart3 className="text-moss" /><p className="mt-3 font-semibold">Live progress</p></div>
            <div className="rounded-lg bg-white p-4 shadow-soft"><KeyRound className="text-moss" /><p className="mt-3 font-semibold">JWT secure</p></div>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">Use the account created by your company admin.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Email</span>
              <input className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-3" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <input type="password" className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-3" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
            <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
          </form>
          <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            First login is created from Render environment variables: <span className="font-semibold">ADMIN_EMAIL</span> and <span className="font-semibold">ADMIN_PASSWORD</span>.
          </div>
        </Card>
      </div>
    </main>
  );
}
