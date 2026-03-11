"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";

type Result = {
  id: number; matric_number: string; student_name: string; current_level: string;
  course_code: string; course_title: string;
  ca_score: number; exam_score: number; total_score: number;
  grade: string; status: string; session: string; semester: string;
  entered_by: string; entered_role: string;
};

export default function HODDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [filter, setFilter]   = useState({ status: "submitted", semester: "", level: "" });
  const [msg, setMsg]         = useState("");
  const [tab, setTab]         = useState("dashboard");
  const [busy, setBusy]       = useState<number | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("staff_user");
    if (!u) { router.push("/staff/login"); return; }
    const parsed = JSON.parse(u);
    if (!["hod","admin"].includes(parsed.role)) { router.push("/staff/login"); return; }
    setUser(parsed);
    loadDashboard();
    loadResults();
  }, []);

  async function loadDashboard() {
    try {
      const r = await ApiClient.fetch<any>("/hod/dashboard");
      setStats(r.data);
    } catch {}
  }

  async function loadResults() {
    try {
      const p = new URLSearchParams(filter as any).toString();
      const r = await ApiClient.fetch<any>(`/hod/results?${p}`);
      setResults(r.data?.results ?? []);
    } catch (e: any) { setMsg(e.message); }
  }

  async function approve(id: number) {
    setBusy(id);
    try {
      await ApiClient.fetch<any>(`/hod/scores/${id}/approve`, { method: "POST" });
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
      setMsg("✅ Score approved.");
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setBusy(null); }
  }

  async function reject(id: number) {
    setBusy(id);
    const reason = prompt("Reason for rejection (optional):");
    try {
      await ApiClient.fetch<any>(`/hod/scores/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: "draft" } : r));
      setMsg("Score returned to draft.");
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setBusy(null); }
  }

  const statCard = (label: string, value: any, color: string) => (
    <div style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "0.75rem", padding: "1.25rem 1.5rem"
    }}>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ color, fontSize: "2rem", fontWeight: 800 }}>{value ?? "—"}</div>
    </div>
  );

  const statusColor = (s: string) =>
    s === "approved" ? "#86efac" : s === "submitted" ? "#fcd34d" : "rgba(255,255,255,0.4)";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <nav style={{
        background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>HOD Dashboard</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{user?.name} · {stats?.department?.name}</div>
        </div>
        <button onClick={() => { ApiClient.setToken(null); localStorage.removeItem("staff_user"); router.push("/staff/login"); }}
          style={{ background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#fca5a5",borderRadius:"0.5rem",padding:"0.4rem 1rem",cursor:"pointer" }}>
          Sign Out
        </button>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 66px)" }}>
        <aside style={{ width: 200, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 1rem" }}>
          {["dashboard","approvals"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              display:"block",width:"100%",textAlign:"left",
              background:tab===t?"rgba(59,130,246,0.2)":"transparent",
              border:tab===t?"1px solid rgba(59,130,246,0.4)":"1px solid transparent",
              borderRadius:"0.5rem",color:tab===t?"#93c5fd":"rgba(255,255,255,0.6)",
              cursor:"pointer",fontSize:"0.88rem",fontWeight:tab===t?600:400,
              padding:"0.6rem 0.75rem",marginBottom:"0.4rem",textTransform:"capitalize"
            }}>{t === "dashboard" ? "📊 Overview" : "✅ Approvals"}</button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {msg && (
            <div style={{
              background: msg.startsWith("✅")?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",
              border:`1px solid ${msg.startsWith("✅")?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,
              borderRadius:"0.5rem",color:msg.startsWith("✅")?"#86efac":"#fca5a5",
              padding:"0.6rem 1rem",marginBottom:"1rem",fontSize:"0.88rem",display:"flex",justifyContent:"space-between"
            }}>
              {msg} <span style={{ cursor:"pointer" }} onClick={() => setMsg("")}>✕</span>
            </div>
          )}

          {tab === "dashboard" && (
            <div>
              <h2 style={{ color: "#fff", marginTop: 0 }}>Department Overview</h2>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"1rem",marginBottom:"2rem" }}>
                {statCard("Total Students", stats?.total_students, "#60a5fa")}
                {statCard("Pending Approvals", stats?.pending_approvals, "#fbbf24")}
                {statCard("Total Courses", stats?.total_courses, "#a78bfa")}
              </div>
              {(stats?.pending_approvals ?? 0) > 0 && (
                <div style={{
                  background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",
                  borderRadius:"0.75rem",padding:"1rem 1.25rem",color:"#fcd34d",fontSize:"0.88rem"
                }}>
                  ⚠️ You have <strong>{stats.pending_approvals}</strong> score submission(s) awaiting your approval.{" "}
                  <button onClick={() => setTab("approvals")} style={{ background:"none",border:"none",color:"#93c5fd",cursor:"pointer",textDecoration:"underline" }}>
                    Review now →
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "approvals" && (
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1.5rem",flexWrap:"wrap" }}>
                <h2 style={{ color:"#fff",margin:0 }}>Score Approvals</h2>
                <select value={filter.status} onChange={e => setFilter(f=>({...f,status:e.target.value}))}
                  style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",fontSize:"0.82rem" }}>
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                </select>
                <select value={filter.semester} onChange={e => setFilter(f=>({...f,semester:e.target.value}))}
                  style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:"0.4rem",padding:"0.35rem 0.5rem",fontSize:"0.82rem" }}>
                  <option value="">All Semesters</option>
                  <option value="First semester">First Semester</option>
                  <option value="Second semester">Second Semester</option>
                </select>
                <button onClick={loadResults} style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",border:"none",color:"#fff",borderRadius:"0.5rem",padding:"0.35rem 0.9rem",cursor:"pointer",fontSize:"0.82rem" }}>Filter</button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                      {["Matric","Student","Course","CA","Exam","Total","Grade","Entered By","Status","Action"].map(h=>(
                        <th key={h} style={{ color:"rgba(255,255,255,0.5)",textAlign:"left",padding:"0.6rem 0.5rem",fontWeight:600,whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0
                      ? <tr><td colSpan={10} style={{ color:"rgba(255,255,255,0.3)",padding:"2rem",textAlign:"center" }}>No results to display.</td></tr>
                      : results.map(r => (
                        <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ padding:"0.5rem",color:"#60a5fa" }}>{r.matric_number}</td>
                          <td style={{ padding:"0.5rem",color:"#fff" }}>{r.student_name}</td>
                          <td style={{ padding:"0.5rem",color:"rgba(255,255,255,0.7)" }}>{r.course_code}</td>
                          <td style={{ padding:"0.5rem",color:"#fff" }}>{r.ca_score}</td>
                          <td style={{ padding:"0.5rem",color:"#fff" }}>{r.exam_score}</td>
                          <td style={{ padding:"0.5rem",color:"#fff",fontWeight:700 }}>{r.total_score}</td>
                          <td style={{ padding:"0.5rem",fontWeight:700,color:r.grade==="A"?"#86efac":r.grade==="F"?"#fca5a5":"#fcd34d" }}>{r.grade}</td>
                          <td style={{ padding:"0.5rem",color:"rgba(255,255,255,0.5)",fontSize:"0.78rem" }}>
                            {r.entered_by}<br/><span style={{ color:"#a78bfa" }}>{r.entered_role}</span>
                          </td>
                          <td style={{ padding:"0.5rem" }}>
                            <span style={{
                              background:`${statusColor(r.status)}20`,color:statusColor(r.status),
                              borderRadius:"999px",padding:"0.15rem 0.6rem",fontSize:"0.75rem"
                            }}>{r.status}</span>
                          </td>
                          <td style={{ padding:"0.5rem" }}>
                            {r.status === "submitted" && (
                              <div style={{ display:"flex",gap:"0.3rem" }}>
                                <button onClick={() => approve(r.id)} disabled={busy===r.id}
                                  style={{ background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",color:"#86efac",borderRadius:"0.35rem",padding:"0.2rem 0.6rem",cursor:"pointer",fontSize:"0.78rem" }}>
                                  ✓
                                </button>
                                <button onClick={() => reject(r.id)} disabled={busy===r.id}
                                  style={{ background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#fca5a5",borderRadius:"0.35rem",padding:"0.2rem 0.6rem",cursor:"pointer",fontSize:"0.78rem" }}>
                                  ✕
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
