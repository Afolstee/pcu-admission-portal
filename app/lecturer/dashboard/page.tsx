"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import * as XLSX from "xlsx";

type Course = {
  assignment_id: number; course_id: number; course_code: string;
  course_title: string; credit_units: number; department: string;
  session: string; semester: string; enrolled_count: number;
};
type Student = {
  student_id: number; matric_number: string; student_name: string;
  program_name: string; current_level: string;
  score_id?: number; ca_score?: number; exam_score?: number;
  total_score?: number; grade?: string; score_status?: string;
};

export default function LecturerDashboard() {
  const router = useRouter();
  const [user, setUser]           = useState<any>(null);
  const [courses, setCourses]     = useState<Course[]>([]);
  const [selected, setSelected]   = useState<Course | null>(null);
  const [students, setStudents]   = useState<Student[]>([]);
  const [scores, setScores]       = useState<Record<number, { ca: string; exam: string }>>({});
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState("");
  const [tab, setTab]             = useState<"courses" | "entry" | "upload" | "submissions">("courses");
  const uploadInputRef            = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState<any>(null);
  const [history, setHistory]     = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("staff_user");
    if (!u) { router.push("/staff/login"); return; }
    const parsed = JSON.parse(u);
    if (!["lecturer","deo","hod","admin"].includes(parsed.role)) {
      router.push("/staff/login"); return;
    }
    setUser(parsed);
    loadCourses();
    loadHistory(parsed.id);
  }, []);

  async function loadHistory(staffId: number) {
    try {
      const res = await fetch(`/api/results/pending?staffId=${staffId}`);
      if (res.ok) setHistory(await res.json());
    } catch {}
  }

  async function loadCourses() {
    try {
      const res = await ApiClient.fetch<any>("/staff/courses");
      setCourses(res.data?.courses ?? []);
    } catch { /* handled */ }
  }

  async function selectCourse(course: Course) {
    setSelected(course);
    setTab("entry");
    try {
      const res = await ApiClient.fetch<any>(
        `/staff/courses/${course.course_id}/students?session=${course.session}&semester=${course.semester}`);
      const studs: Student[] = res.data?.students ?? [];
      setStudents(studs);
      // Pre-fill existing scores
      const init: Record<number, { ca: string; exam: string }> = {};
      studs.forEach(s => {
        init[s.student_id] = {
          ca:   s.ca_score !== null && s.ca_score !== undefined ? String(s.ca_score) : "",
          exam: s.exam_score !== null && s.exam_score !== undefined ? String(s.exam_score) : "",
        };
      });
      setScores(init);
    } catch (e: any) { setMsg(e.message); }
  }

  async function saveScores(submit = false) {
    if (!selected) return;
    setSaving(true); setMsg("");
    const entries = students.map(s => ({
      student_id: s.student_id,
      ca_score:   parseFloat(scores[s.student_id]?.ca || "0"),
      exam_score: parseFloat(scores[s.student_id]?.exam || "0"),
    }));
    try {
      await ApiClient.fetch<any>("/scores/enter", {
        method: "POST",
        body: JSON.stringify({
          course_id: selected.course_id,
          session:   selected.session,
          semester:  selected.semester,
          scores:    entries,
        }),
      });
      if (submit) {
        await ApiClient.fetch<any>("/scores/submit", {
          method: "POST",
          body: JSON.stringify({
            course_id: selected.course_id,
            session:   selected.session,
            semester:  selected.semester,
          }),
        });
        setMsg("✅ Scores saved and submitted for HOD approval.");
      } else {
        setMsg("✅ Scores saved as draft.");
      }
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setSaving(false); }
  }

  function updateScore(studentId: number, field: "ca" | "exam", val: string) {
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: val } }));
  }

  function logout() {
    ApiClient.setToken(null);
    localStorage.removeItem("staff_user");
    router.push("/staff/login");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("");
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const parsed = parseExcelForUpload(sheet);
        
        const b64Reader = new FileReader();
        b64Reader.onload = (b64evt) => {
          setPreview({
            fileName: file.name,
            sheetName: wb.SheetNames[0],
            fileContent: b64evt.target?.result as string,
            ...parsed
          });
        };
        b64Reader.readAsDataURL(file);
      } catch (err: any) {
        setMsg("❌ Failed to parse Excel: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function parseExcelForUpload(sheet: XLSX.WorkSheet) {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    const metadata: any = {};
    const students: any[] = [];
    
    // Simple metadata extraction (similar to ICT logic but simplified)
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const rowStr = (data[i] || []).join(" ").toUpperCase();
      if (rowStr.includes("SESSION")) {
        const m = rowStr.match(/(\d{4}\/\d{4})/);
        if (m) metadata.academicSession = m[1];
      }
      if (rowStr.includes("SEMESTER")) {
        if (rowStr.includes("FIRST")) metadata.semester = "First Semester";
        else if (rowStr.includes("SECOND")) metadata.semester = "Second Semester";
      }
    }

    // Find student header
    let headerIdx = -1;
    let matricIdx = -1, nameIdx = -1, scoreStartIdx = -1;
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (!r) continue;
      for (let j = 0; j < r.length; j++) {
        const c = String(r[j] || "").toLowerCase();
        if (c.includes("matric")) { matricIdx = j; headerIdx = i; }
        if (c.includes("name") && headerIdx === i) { nameIdx = j; scoreStartIdx = j + 1; }
      }
      if (headerIdx !== -1) break;
    }

    if (headerIdx === -1) throw new Error("Could not find student headers (Matric No/Name)");

    const courses: string[] = [];
    const hRow = data[headerIdx];
    for (let j = scoreStartIdx; j < hRow.length; j++) {
      const code = String(hRow[j] || "").trim().toUpperCase();
      if (code && !["TOTAL","GRADE"].includes(code)) courses.push(code);
    }

    for (let i = headerIdx + 1; i < data.length; i++) {
      const r = data[i];
      if (!r || !r[matricIdx]) continue;
      
      const studCourses: any[] = [];
      courses.forEach((code, idx) => {
        const score = parseFloat(String(r[scoreStartIdx + idx] || "0"));
        if (!isNaN(score)) studCourses.push({ code, score });
      });

      students.push({
        matricNumber: String(r[matricIdx]).trim(),
        name: String(r[nameIdx]).trim(),
        courses: studCourses
      });
    }

    return { metadata, students, courses };
  }

  async function submitToICT() {
    if (!preview || !user) return;
    setUploading(true); setMsg("");
    try {
      const resultsFormatted = preview.students.map((s: any) => ({
        studentInfo: {
          name: s.name,
          matricNumber: s.matricNumber,
          level: "100", // Default or extract
          faculty: preview.metadata.faculty || "Unknown",
          department: preview.metadata.department || "Unknown",
          academicSession: preview.metadata.academicSession || "2024/2025",
          semester: preview.metadata.semester || "First Semester"
        },
        courses: s.courses
      }));

      const res = await fetch("/api/results/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: user.id,
          fileName: preview.fileName,
          sheetName: preview.sheetName,
          courseCode: preview.courses.join(","),
          payload: resultsFormatted,
          fileContent: preview.fileContent
        })
      });

      if (!res.ok) throw new Error("Server error saving pending results");
      
      setMsg("✅ Successfully submitted to ICT for processing.");
      setPreview(null);
      if (user) loadHistory(user.id);
    } catch (err: any) {
      setMsg("❌ Error submitting: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "1rem"
          }}>L</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700 }}>Lecturer Portal</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>{user?.name}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#fca5a5", borderRadius: "0.5rem", padding: "0.4rem 1rem", cursor: "pointer"
        }}>Sign Out</button>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 66px)" }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 1rem"
        }}>
          {[
            { id: "courses",     label: "📚 My Courses" },
            { id: "entry",       label: "✏️ Score Entry" },
            { id: "upload",      label: "📤 Bulk Upload" },
            { id: "submissions", label: "📜 Upload History" },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as any)} style={{
              display: "block", width: "100%", textAlign: "left",
              background: tab === item.id ? "rgba(59,130,246,0.2)" : "transparent",
              border: tab === item.id ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
              borderRadius: "0.5rem", color: tab === item.id ? "#93c5fd" : "rgba(255,255,255,0.6)",
              cursor: "pointer", fontSize: "0.88rem", fontWeight: tab === item.id ? 600 : 400,
              padding: "0.6rem 0.75rem", marginBottom: "0.4rem"
            }}>{item.label}</button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {tab === "courses" && (
            <div>
              <h2 style={{ color: "#fff", marginTop: 0 }}>Assigned Courses</h2>
              {courses.length === 0
                ? <p style={{ color: "rgba(255,255,255,0.4)" }}>No courses assigned yet.</p>
                : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
                    {courses.map(c => (
                      <div key={c.assignment_id} style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem", padding: "1.25rem"
                      }}>
                        <div style={{ color: "#60a5fa", fontSize: "0.8rem", fontWeight: 600 }}>{c.course_code}</div>
                        <div style={{ color: "#fff", fontWeight: 700, margin: "0.25rem 0 0.5rem" }}>{c.course_title}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
                          {c.semester} · {c.session}<br />
                          {c.enrolled_count} enrolled
                        </div>
                        <button onClick={() => selectCourse(c)} style={{
                          marginTop: "0.75rem", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                          border: "none", borderRadius: "0.5rem", color: "#fff",
                          padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.82rem"
                        }}>Enter Scores →</button>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {tab === "upload" && (
            <div style={{ maxWidth: 800 }}>
              <h2 style={{ color: "#fff", marginTop: 0 }}>Bulk Result Upload</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", maxWidth: 600 }}>
                Upload an Excel file containing results. The ICT Director will review and process these results into the official records.
              </p>

              <div style={{
                background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)",
                borderRadius: "1rem", padding: "3rem", textAlign: "center", marginTop: "1.5rem",
                cursor: "pointer"
              }} onClick={() => uploadInputRef.current?.click()}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📄</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Click to select Excel file</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Supports .xlsx, .xls</div>
                <input 
                   type="file" ref={uploadInputRef} hidden accept=".xlsx,.xls"
                   onChange={e => handleFileChange(e)}
                />
              </div>

              {preview && (
                <div style={{ marginTop: "2rem" }}>
                  <div style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: "1rem" 
                  }}>
                    <h3 style={{ color: "#fff", margin: 0 }}>File Preview: {preview.fileName}</h3>
                    <button 
                      onClick={submitToICT}
                      disabled={uploading}
                      style={{
                        background: "linear-gradient(135deg,#10b981,#34d399)", border: "none",
                        color: "#fff", borderRadius: "0.5rem", padding: "0.6rem 1.5rem",
                        cursor: "pointer", fontWeight: 700, boxShadow: "0 4px 12px rgba(16,185,129,0.2)"
                      }}
                    >
                      {uploading ? "Uploading..." : "Submit to ICT →"}
                    </button>
                  </div>

                  <div style={{ 
                    background: "rgba(255,255,255,0.05)", borderRadius: "0.75rem", 
                    overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" 
                  }}>
                    <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                       <div>
                         <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase" }}>Session</div>
                         <div style={{ color: "#fff", fontWeight: 600 }}>{preview.metadata.academicSession || "N/A"}</div>
                       </div>
                       <div>
                         <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase" }}>Semester</div>
                         <div style={{ color: "#fff", fontWeight: 600 }}>{preview.metadata.semester || "N/A"}</div>
                       </div>
                       <div>
                         <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textTransform: "uppercase" }}>Found</div>
                         <div style={{ color: "#fff", fontWeight: 600 }}>{preview.students.length} Students</div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
              
              {msg && (
                <div style={{
                  marginTop: "1.5rem",
                  background: msg.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius: "0.5rem", color: msg.startsWith("✅") ? "#86efac" : "#fca5a5",
                  padding: "0.6rem 1rem", fontSize: "0.88rem"
                }}>{msg}</div>
              )}
            </div>
          )}

          {tab === "entry" && (
            <div>
              {!selected
                ? <p style={{ color: "rgba(255,255,255,0.4)" }}>← Select a course first.</p>
                : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                      <button onClick={() => setTab("courses")} style={{
                        background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.6)", borderRadius: "0.5rem",
                        padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.82rem"
                      }}>← Back</button>
                      <div>
                        <h2 style={{ color: "#fff", margin: 0 }}>{selected.course_code} — {selected.course_title}</h2>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>{selected.semester} · {selected.session}</div>
                      </div>
                    </div>

                    {msg && (
                      <div style={{
                        background: msg.startsWith("✅") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        borderRadius: "0.5rem", color: msg.startsWith("✅") ? "#86efac" : "#fca5a5",
                        padding: "0.6rem 1rem", marginBottom: "1rem", fontSize: "0.88rem"
                      }}>{msg}</div>
                    )}

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            {["Matric No","Name","Level","CA (40)","Exam (60)","Total","Grade","Status"].map(h => (
                              <th key={h} style={{ color: "rgba(255,255,255,0.5)", textAlign: "left", padding: "0.6rem 0.75rem", fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.map(s => {
                            const ca   = parseFloat(scores[s.student_id]?.ca || "0");
                            const exam = parseFloat(scores[s.student_id]?.exam || "0");
                            const tot  = ca + exam;
                            const grade = tot>=70?"A":tot>=60?"B":tot>=50?"C":tot>=45?"D":tot>=40?"E":"F";
                            return (
                              <tr key={s.student_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <td style={{ padding: "0.6rem 0.75rem", color: "#60a5fa" }}>{s.matric_number}</td>
                                <td style={{ padding: "0.6rem 0.75rem", color: "#fff" }}>{s.student_name}</td>
                                <td style={{ padding: "0.6rem 0.75rem", color: "rgba(255,255,255,0.5)" }}>{s.current_level}</td>
                                <td style={{ padding: "0.4rem 0.5rem" }}>
                                  <input
                                    type="number" min="0" max="40" step="0.5"
                                    value={scores[s.student_id]?.ca ?? ""}
                                    onChange={e => updateScore(s.student_id, "ca", e.target.value)}
                                    style={{ width: 65, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.35rem", color: "#fff", padding: "0.3rem 0.5rem" }}
                                  />
                                </td>
                                <td style={{ padding: "0.4rem 0.5rem" }}>
                                  <input
                                    type="number" min="0" max="60" step="0.5"
                                    value={scores[s.student_id]?.exam ?? ""}
                                    onChange={e => updateScore(s.student_id, "exam", e.target.value)}
                                    style={{ width: 65, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.35rem", color: "#fff", padding: "0.3rem 0.5rem" }}
                                  />
                                </td>
                                <td style={{ padding: "0.6rem 0.75rem", color: "#fff", fontWeight: 700 }}>{tot.toFixed(1)}</td>
                                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: grade==="A"?"#86efac":grade==="F"?"#fca5a5":"#fcd34d" }}>{grade}</td>
                                <td style={{ padding: "0.6rem 0.75rem" }}>
                                  <span style={{
                                    background: s.score_status==="approved"?"rgba(34,197,94,0.15)":s.score_status==="submitted"?"rgba(251,191,36,0.15)":"rgba(255,255,255,0.08)",
                                    color: s.score_status==="approved"?"#86efac":s.score_status==="submitted"?"#fcd34d":"rgba(255,255,255,0.4)",
                                    borderRadius: "999px", padding: "0.15rem 0.6rem", fontSize: "0.75rem"
                                  }}>{s.score_status || "draft"}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                      <button onClick={() => saveScores(false)} disabled={saving} style={{
                        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", borderRadius: "0.6rem", padding: "0.6rem 1.25rem", cursor: "pointer"
                      }}>💾 Save Draft</button>
                      <button onClick={() => saveScores(true)} disabled={saving} style={{
                        background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none",
                        color: "#fff", borderRadius: "0.6rem", padding: "0.6rem 1.25rem",
                        cursor: "pointer", fontWeight: 600
                      }}>📤 Submit for Approval</button>
                    </div>
                  </>
                )
              }
            </div>
          )}
          {tab === "submissions" && (
            <div>
              <h2 style={{ color: "#fff", marginTop: 0 }}>My Recent Submissions</h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                Track the status of your bulk result uploads here.
              </p>

              {history.length === 0 ? (
                <div style={{ 
                  textAlign: "center", padding: "4rem", 
                  background: "rgba(255,255,255,0.02)", borderRadius: "1rem",
                  border: "1px dashed rgba(255,255,255,0.1)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</div>
                  <div style={{ color: "rgba(255,255,255,0.4)" }}>No submissions found.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {history.map((h: any) => (
                    <div key={h.id} style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem", padding: "1.25rem", display: "flex", justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700 }}>{h.file_name}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                          {new Date(h.created_at).toLocaleString()} · {h.course_code || "Multiple Courses"}
                        </div>
                      </div>
                      <div style={{
                        background: h.status === "pending" ? "rgba(251,191,36,0.1)" : "rgba(34,197,94,0.1)",
                        color: h.status === "pending" ? "#fcd34d" : "#86efac",
                        padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem",
                        fontWeight: 600, textTransform: "uppercase"
                      }}>
                        {h.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
