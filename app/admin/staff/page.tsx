"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";

type StaffMember = {
  id: number; name: string; email: string; role: string; status: string;
  staff_id: string; title: string; department: string; faculty: string;
  department_id: number; faculty_id: number;
};
type Department = { id: number; name: string };
type Faculty    = { id: number; name: string };
type Course     = { id: number; course_code: string; course_title: string };

const ROLES = ["lecturer","deo","hod","dean","registrar","admin"];

export default function AdminStaffPage() {
  const router  = useRouter();
  const [staff, setStaff]     = useState<StaffMember[]>([]);
  const [depts, setDepts]     = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [msg, setMsg]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [form, setForm] = useState({
    name:"", email:"", password:"", role:"lecturer", phone_number:"",
    staff_id:"", title:"", department_id:"", faculty_id:""
  });
  const [assign, setAssign] = useState({
    staff_id:"", course_id:"", session:"2024/2025", semester:"First semester"
  });

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/auth/login");
      return;
    }
    loadStaff();
    loadMeta();
  }, [isAuthenticated, user, router]);

  async function loadStaff() {
    try {
      const p = roleFilter ? `?role=${roleFilter}` : "";
      const r = await ApiClient.fetch<any>(`/staff/list${p}`);
      setStaff(r.data?.staff ?? []);
    } catch {}
  }
  async function loadMeta() {
    try {
      const [dr, fr, cr] = await Promise.all([
        ApiClient.fetch<any>("/admin/departments"),
        ApiClient.fetch<any>("/admin/faculties"),
        ApiClient.fetch<any>("/admin/courses-list"),
      ]);
      setDepts(dr.data?.departments ?? []);
      setFaculties(fr.data?.faculties ?? []);
      setCourses(cr.data?.courses ?? []);
    } catch {}
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ApiClient.fetch<any>("/staff/create", {
        method:"POST", body:JSON.stringify({
          ...form,
          department_id: form.department_id ? Number(form.department_id) : undefined,
          faculty_id: form.faculty_id ? Number(form.faculty_id) : undefined,
        })
      });
      setMsg("✅ Staff account created.");
      setShowCreate(false);
      setForm({ name:"",email:"",password:"",role:"lecturer",phone_number:"",staff_id:"",title:"",department_id:"",faculty_id:"" });
      loadStaff();
    } catch (e: any) { setMsg("❌ " + e.message); }
  }

  async function assignCourse(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ApiClient.fetch<any>("/staff/assign-course", {
        method:"POST", body:JSON.stringify({
          staff_id:  Number(assign.staff_id),
          course_id: Number(assign.course_id),
          session:   assign.session,
          semester:  assign.semester,
        })
      });
      setMsg("✅ Course assigned to lecturer.");
      setShowAssign(false);
    } catch (e: any) { setMsg("❌ " + e.message); }
  }

  async function toggleStatus(userId: number, current: string) {
    const next = current === "active" ? "inactive" : "active";
    try {
      await ApiClient.fetch<any>(`/staff/${userId}`, {
        method:"PUT", body:JSON.stringify({ status: next })
      });
      setStaff(prev => prev.map(s => s.id===userId ? { ...s, status:next } : s));
    } catch (e: any) { setMsg("❌ " + e.message); }
  }

  const roleBadgeColor = (r: string) => ({
    admin:"#f97316",hod:"#a78bfa",dean:"#60a5fa",
    lecturer:"#34d399",deo:"#fbbf24",registrar:"#f472b6"
  } as Record<string,string>)[r] || "#94a3b8";

  const fieldStyle = {
    background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
    color:"#fff", borderRadius:"0.5rem", padding:"0.5rem 0.75rem",
    fontSize:"0.88rem", width:"100%", boxSizing:"border-box" as const
  };
  const labelStyle = { color:"rgba(255,255,255,0.6)", fontSize:"0.8rem", marginBottom:"0.3rem", display:"block" as const };

  return (
    <div style={{ padding:"2rem", fontFamily:"Inter, sans-serif", minHeight:"100vh", background:"#0f172a" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.75rem" }}>
          <div>
            <h1 style={{ color:"#fff", margin:0, fontSize:"1.5rem" }}>Staff Management</h1>
            <p style={{ color:"rgba(255,255,255,0.45)", margin:"0.25rem 0 0", fontSize:"0.85rem" }}>Create accounts, assign roles & courses</p>
          </div>
          <div style={{ display:"flex", gap:"0.6rem" }}>
            <button onClick={()=>setShowAssign(true)} style={{ background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",color:"#a78bfa",borderRadius:"0.6rem",padding:"0.5rem 1rem",cursor:"pointer",fontWeight:600,fontSize:"0.88rem" }}>
              📌 Assign Course
            </button>
            <button onClick={()=>setShowCreate(true)} style={{ background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",border:"none",color:"#fff",borderRadius:"0.6rem",padding:"0.5rem 1rem",cursor:"pointer",fontWeight:600,fontSize:"0.88rem" }}>
              + New Staff
            </button>
          </div>
        </div>

        {msg && (
          <div style={{
            background:msg.startsWith("✅")?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",
            border:`1px solid ${msg.startsWith("✅")?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,
            borderRadius:"0.5rem",color:msg.startsWith("✅")?"#86efac":"#fca5a5",
            padding:"0.6rem 1rem",marginBottom:"1rem",fontSize:"0.88rem",display:"flex",justifyContent:"space-between"
          }}>
            {msg} <span style={{ cursor:"pointer" }} onClick={()=>setMsg("")}>✕</span>
          </div>
        )}

        {/* Filters */}
        <div style={{ display:"flex", gap:"0.6rem", marginBottom:"1rem" }}>
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ ...fieldStyle, width:"auto" }}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={loadStaff} style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:"0.5rem",padding:"0.4rem 0.9rem",cursor:"pointer",fontSize:"0.85rem" }}>Filter</button>
        </div>

        {/* Staff Table */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"0.75rem", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.85rem" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.02)" }}>
                {["Name","Email","Role","Department","Faculty","Status","Action"].map(h=>(
                  <th key={h} style={{ color:"rgba(255,255,255,0.5)",textAlign:"left",padding:"0.75rem 0.9rem",fontWeight:600,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length===0
                ? <tr><td colSpan={7} style={{ color:"rgba(255,255,255,0.3)",padding:"2.5rem",textAlign:"center" }}>No staff accounts yet.</td></tr>
                : staff.map(s=>(
                  <tr key={s.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding:"0.65rem 0.9rem",color:"#fff",fontWeight:500 }}>
                      {s.title && <span style={{ color:"rgba(255,255,255,0.45)",marginRight:"0.25rem" }}>{s.title}</span>}
                      {s.name}
                    </td>
                    <td style={{ padding:"0.65rem 0.9rem",color:"rgba(255,255,255,0.5)",fontSize:"0.8rem" }}>{s.email}</td>
                    <td style={{ padding:"0.65rem 0.9rem" }}>
                      <span style={{ background:`${roleBadgeColor(s.role)}20`,color:roleBadgeColor(s.role),borderRadius:"999px",padding:"0.15rem 0.65rem",fontSize:"0.78rem",fontWeight:600 }}>{s.role}</span>
                    </td>
                    <td style={{ padding:"0.65rem 0.9rem",color:"rgba(255,255,255,0.6)" }}>{s.department||"—"}</td>
                    <td style={{ padding:"0.65rem 0.9rem",color:"rgba(255,255,255,0.6)" }}>{s.faculty||"—"}</td>
                    <td style={{ padding:"0.65rem 0.9rem" }}>
                      <span style={{
                        background:s.status==="active"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)",
                        color:s.status==="active"?"#86efac":"#fca5a5",
                        borderRadius:"999px",padding:"0.15rem 0.65rem",fontSize:"0.75rem"
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding:"0.65rem 0.9rem" }}>
                      <button onClick={()=>toggleStatus(s.id,s.status)} style={{
                        background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",
                        color:"rgba(255,255,255,0.7)",borderRadius:"0.35rem",padding:"0.2rem 0.65rem",cursor:"pointer",fontSize:"0.78rem"
                      }}>{s.status==="active"?"Deactivate":"Activate"}</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreate && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"1rem" }}>
          <div style={{ background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"1rem",padding:"2rem",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto" }}>
            <h2 style={{ color:"#fff",marginTop:0 }}>Create Staff Account</h2>
            <form onSubmit={createStaff} style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
              {[
                { key:"name",label:"Full Name",type:"text",required:true },
                { key:"email",label:"Email",type:"email",required:true },
                { key:"password",label:"Initial Password",type:"password",required:true },
                { key:"phone_number",label:"Phone Number",type:"text" },
                { key:"staff_id",label:"Staff ID",type:"text" },
                { key:"title",label:"Title (Dr., Prof., Mr., etc.)",type:"text" },
              ].map(f=>(
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}{f.required&&<span style={{color:"#f87171"}}> *</span>}</label>
                  <input type={f.type} required={f.required} value={(form as any)[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={fieldStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Role <span style={{color:"#f87171"}}>*</span></label>
                <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={fieldStyle}>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select value={form.department_id} onChange={e=>setForm(p=>({...p,department_id:e.target.value}))} style={fieldStyle}>
                  <option value="">— None —</option>
                  {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Faculty</label>
                <select value={form.faculty_id} onChange={e=>setForm(p=>({...p,faculty_id:e.target.value}))} style={fieldStyle}>
                  <option value="">— None —</option>
                  {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div style={{ display:"flex",gap:"0.75rem",marginTop:"0.5rem" }}>
                <button type="submit" style={{ flex:1,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",border:"none",color:"#fff",borderRadius:"0.6rem",padding:"0.65rem",cursor:"pointer",fontWeight:600 }}>
                  Create Account
                </button>
                <button type="button" onClick={()=>setShowCreate(false)} style={{ flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:"0.6rem",padding:"0.65rem",cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {showAssign && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"1rem" }}>
          <div style={{ background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"1rem",padding:"2rem",width:"100%",maxWidth:420 }}>
            <h2 style={{ color:"#fff",marginTop:0 }}>Assign Course to Lecturer</h2>
            <form onSubmit={assignCourse} style={{ display:"flex",flexDirection:"column",gap:"0.85rem" }}>
              <div>
                <label style={labelStyle}>Lecturer (Staff)</label>
                <select value={assign.staff_id} onChange={e=>setAssign(p=>({...p,staff_id:e.target.value}))} style={fieldStyle} required>
                  <option value="">— Select lecturer —</option>
                  {staff.filter(s=>["lecturer","deo"].includes(s.role)).map(s=>(
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Course</label>
                <select value={assign.course_id} onChange={e=>setAssign(p=>({...p,course_id:e.target.value}))} style={fieldStyle} required>
                  <option value="">— Select course —</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.course_code} — {c.course_title}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Session</label>
                <input value={assign.session} onChange={e=>setAssign(p=>({...p,session:e.target.value}))} style={fieldStyle} placeholder="e.g. 2024/2025" required />
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <select value={assign.semester} onChange={e=>setAssign(p=>({...p,semester:e.target.value}))} style={fieldStyle}>
                  <option value="First semester">First Semester</option>
                  <option value="Second semester">Second Semester</option>
                </select>
              </div>
              <div style={{ display:"flex",gap:"0.75rem",marginTop:"0.5rem" }}>
                <button type="submit" style={{ flex:1,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",border:"none",color:"#fff",borderRadius:"0.6rem",padding:"0.65rem",cursor:"pointer",fontWeight:600 }}>
                  Assign
                </button>
                <button type="button" onClick={()=>setShowAssign(false)} style={{ flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:"0.6rem",padding:"0.65rem",cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
