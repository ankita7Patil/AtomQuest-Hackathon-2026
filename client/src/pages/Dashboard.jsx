import { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Download, FileClock, LogOut, Plus, Send, Shield, Target, UsersRound } from "lucide-react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import MetricCard from "../components/MetricCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL, api, getToken } from "../lib/api.js";

const statuses = ["Not Started", "On Track", "Completed"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];

function badgeTone(value) {
  if (["Approved", "Completed", "On Track"].includes(value)) return "bg-emerald-100 text-emerald-700";
  if (["Submitted"].includes(value)) return "bg-amber-100 text-amber-700";
  if (["Rejected"].includes(value)) return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function GoalForm({ onCreated, currentWeightage }) {
  const [form, setForm] = useState({ title: "", description: "", weightage: "", planned: 25, actual: 0, status: "Not Started" });
  const [error, setError] = useState("");
  const remaining = 100 - currentWeightage;

  async function submit(event) {
    event.preventDefault();
    setError("");
    const weightage = Number(form.weightage);
    if (weightage < 10) return setError("Minimum weightage per goal is 10%.");
    if (weightage > remaining) return setError(`Only ${remaining}% weightage is available in the current plan.`);
    try {
      await api("/api/goals", { method: "POST", body: JSON.stringify(form) });
      setForm({ title: "", description: "", weightage: "", planned: 25, actual: 0, status: "Not Started" });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Create goal</h2>
        <span className="rounded-md bg-mint px-2 py-1 text-xs font-bold text-moss">{remaining}% left</span>
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="focus-ring min-h-20 rounded-md border border-slate-200 px-3 py-2" placeholder="Business impact and success criteria" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" type="number" min="10" max="100" placeholder="Weightage %" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: e.target.value })} required />
          <input className="focus-ring rounded-md border border-slate-200 px-3 py-2" type="number" min="0" max="100" value={form.planned} onChange={(e) => setForm({ ...form, planned: e.target.value })} />
          <select className="focus-ring rounded-md border border-slate-200 px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <Button><Plus size={16} /> Add goal</Button>
      </form>
    </Card>
  );
}

function CheckIn({ goal, refresh }) {
  const [form, setForm] = useState({ quarter: "Q2", planned: goal.planned || 0, actual: goal.actual || 0, comment: "" });

  async function submit(event) {
    event.preventDefault();
    await api(`/api/goals/${goal._id}/checkins`, { method: "POST", body: JSON.stringify(form) });
    refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-2 rounded-md bg-slate-50 p-3 md:grid-cols-[80px_1fr_1fr_2fr_auto]">
      <select className="focus-ring rounded-md border border-slate-200 px-2 py-2 text-sm" value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })}>
        {quarters.map((quarter) => <option key={quarter}>{quarter}</option>)}
      </select>
      <input className="focus-ring rounded-md border border-slate-200 px-2 py-2 text-sm" type="number" min="0" max="100" value={form.planned} onChange={(e) => setForm({ ...form, planned: e.target.value })} />
      <input className="focus-ring rounded-md border border-slate-200 px-2 py-2 text-sm" type="number" min="0" max="100" value={form.actual} onChange={(e) => setForm({ ...form, actual: e.target.value })} />
      <input className="focus-ring rounded-md border border-slate-200 px-2 py-2 text-sm" placeholder="Check-in note" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
      <Button className="min-h-9 px-3 text-xs">Save</Button>
    </form>
  );
}

function GoalList({ goals, user, refresh }) {
  async function updateStatus(goal, status) {
    await api(`/api/goals/${goal._id}/status`, { method: "PATCH", body: JSON.stringify({ status, actual: status === "Completed" ? 100 : goal.actual }) });
    refresh();
  }

  async function review(goal, decision) {
    await api(`/api/goals/${goal._id}/approval`, { method: "PATCH", body: JSON.stringify({ decision }) });
    refresh();
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-bold">Goal portfolio</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {goals.map((goal) => (
          <article key={goal._id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold">{goal.title}</h3>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${badgeTone(goal.approvalStatus)}`}>{goal.approvalStatus}</span>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${badgeTone(goal.status)}`}>{goal.status}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{goal.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                  <span>Owner: {goal.owner?.name || "You"}</span>
                  <span>Weightage: {goal.weightage}%</span>
                  <span>Planned: {goal.planned}%</span>
                  <span>Actual: {goal.actual}%</span>
                  <span>Shared: {goal.sharedWith?.length || 0}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Button key={status} variant="secondary" className="min-h-9 px-3 text-xs" onClick={() => updateStatus(goal, status)}>{status}</Button>
                ))}
                {(user.role === "manager" || user.role === "admin") && goal.approvalStatus === "Submitted" && (
                  <>
                    <Button className="min-h-9 px-3 text-xs" onClick={() => review(goal, "Approved")}><CheckCircle2 size={14} /> Approve</Button>
                    <Button variant="danger" className="min-h-9 px-3 text-xs" onClick={() => review(goal, "Rejected")}>Reject</Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-moss" style={{ width: `${goal.actual || 0}%` }} />
            </div>
            <CheckIn goal={goal} refresh={refresh} />
          </article>
        ))}
        {!goals.length && <p className="p-5 text-sm text-slate-500">No goals available for this role yet.</p>}
      </div>
    </Card>
  );
}

function AuditTrail() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api("/api/audit").then((data) => setLogs(data.logs)).catch(() => setLogs([]));
  }, []);

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Audit trail</h2>
      <div className="mt-4 space-y-3">
        {logs.slice(0, 8).map((log) => (
          <div key={log._id} className="rounded-md border border-slate-100 p-3 text-sm">
            <p className="font-semibold">{log.action}</p>
            <p className="text-slate-500">{log.actor?.name || "System"} · {new Date(log.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {!logs.length && <p className="text-sm text-slate-500">Audit log is visible for managers and admins.</p>}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState("");

  const ownDraftWeightage = useMemo(() => goals
    .filter((goal) => (goal.owner?._id || goal.owner) === user._id && goal.approvalStatus === "Draft")
    .reduce((sum, goal) => sum + Number(goal.weightage || 0), 0), [goals, user._id]);

  async function load() {
    try {
      const [dashData, goalData] = await Promise.all([api("/api/dashboard"), api("/api/goals")]);
      setDashboard(dashData);
      setGoals(goalData.goals);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function submitPlan() {
    try {
      await api("/api/goals/submit", { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportReport() {
    window.open(`${API_URL}/api/reports/goals.csv?token=${getToken()}`, "_blank");
  }

  const metrics = dashboard?.metrics || {};
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-moss"><Target size={18} /> GoalTrack Portal</div>
            <h1 className="mt-2 text-2xl font-bold text-ink">Welcome, {user.name}</h1>
            <p className="text-sm text-slate-600">{roleLabel} dashboard · {user.department}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.role === "employee" || user.role === "manager") && <Button variant="gold" onClick={submitPlan}><Send size={16} /> Submit plan</Button>}
            {(user.role === "manager" || user.role === "admin") && <Button variant="secondary" onClick={exportReport}><Download size={16} /> Export CSV</Button>}
            <Button variant="secondary" onClick={logout}><LogOut size={16} /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        {error && <p className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Goals visible" value={metrics.totalGoals ?? 0} />
          <MetricCard label="Approved goals" value={metrics.approved ?? 0} tone="gold" />
          <MetricCard label="Submitted goals" value={metrics.submitted ?? 0} tone="ink" />
          <MetricCard label="Completed goals" value={metrics.completed ?? 0} tone="moss" />
          <MetricCard label="Progress score" value={`${metrics.progress ?? 0}%`} tone="coral" />
          <MetricCard label={user.role === "employee" ? "Plan weightage" : "People scope"} value={user.role === "employee" ? `${metrics.totalWeightage ?? 0}%` : metrics.people ?? 0} tone="ink" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.55fr]">
          <div className="space-y-6">
            {(user.role === "employee" || user.role === "manager") && <GoalForm onCreated={load} currentWeightage={ownDraftWeightage} />}
            <Card className="p-5">
              <h2 className="text-lg font-bold">Workflow health</h2>
              <div className="mt-4 space-y-4">
                {(dashboard?.statusBreakdown || []).map((item) => (
                  <div key={item.status}>
                    <div className="mb-1 flex justify-between text-sm font-semibold"><span>{item.status}</span><span>{item.count}</span></div>
                    <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gold" style={{ width: `${Math.min(100, item.count * 25)}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
            {(user.role === "manager" || user.role === "admin") && <AuditTrail />}
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-moss"><Shield size={16} /> Validation guardrails</div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <p><Activity className="mr-2 inline text-moss" size={16} /> Total weightage must equal 100% before submission.</p>
                <p><FileClock className="mr-2 inline text-moss" size={16} /> Each goal needs at least 10% weightage.</p>
                <p><UsersRound className="mr-2 inline text-moss" size={16} /> Managers approve or reject submitted goals.</p>
              </div>
            </Card>
          </div>
          <GoalList goals={goals} user={user} refresh={load} />
        </div>
      </div>
    </main>
  );
}
