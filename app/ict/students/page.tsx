"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { LogOut, ArrowLeft, Search, User, Mail, Hash, BookOpen, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Student = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  matric_number: string;
  current_level: string;
  session: string;
  program_name: string;
  department: string;
};

export default function ICTStudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "ict_director")) {
      router.replace("/staff/login");
      return;
    }
    loadStudents();
  }, [isAuthenticated, user, router]);

  const loadStudents = async (query = "") => {
    setLoading(true);
    try {
      const resp = await ApiClient.fetch<any>(`/student/admin/list?q=${query}`);
      setStudents(resp.data?.students || []);
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(search);
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditForm(student);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await ApiClient.fetch<any>("/student/admin/update", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setMsg("✅ Student profile updated successfully.");
      setEditingId(null);
      loadStudents(search);
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/staff/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/logo new.png" alt="PCU Logo" width={28} height={28} className="object-contain" />
            <span className="font-bold text-lg text-slate-800">PCU ICT Portal - Student Management</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-slate-900 text-right">{user?.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Log Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="link" onClick={() => router.push("/ict/dashboard")} className="p-0 h-auto gap-1 text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Back to ICT Dashboard
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Profile Management</h1>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, email, matric..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {msg && (
          <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${msg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {msg}
            <button onClick={() => setMsg("")} className="text-lg">×</button>
          </div>
        )}

        <div className="grid gap-6">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              Loading student records...
            </div>
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center text-slate-500">
                No students found matching your search.
              </CardContent>
            </Card>
          ) : (
            students.map((student) => (
              <Card key={student.id} className={`transition-all ${editingId === student.id ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-3 w-3" /> {student.email}
                        </div>
                      </div>
                    </div>
                    {editingId === student.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={saveEdit}>
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(student)}>
                        <Edit2 className="h-3 w-3 mr-1" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matric Number</label>
                        {editingId === student.id ? (
                          <Input
                            value={editForm.matric_number || ""}
                            onChange={(e) => setEditForm(p => ({ ...p, matric_number: e.target.value }))}
                            className="h-8 mt-1"
                          />
                        ) : (
                          <div className="flex items-center gap-2 font-mono text-sm mt-1">
                            <Hash className="h-3 w-3" /> {student.matric_number || "NOT ASSIGNED"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level & Session</label>
                        <div className="flex gap-2 mt-1">
                          {editingId === student.id ? (
                            <>
                              <select
                                value={editForm.current_level}
                                onChange={(e) => setEditForm(p => ({ ...p, current_level: e.target.value }))}
                                className="h-8 text-sm border rounded px-2"
                              >
                                {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"].map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                              <Input
                                value={editForm.session}
                                onChange={(e) => setEditForm(p => ({ ...p, session: e.target.value }))}
                                className="h-8 w-24"
                              />
                            </>
                          ) : (
                            <>
                              <Badge variant="secondary">{student.current_level}</Badge>
                              <Badge variant="outline">{student.session}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                       <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program</label>
                        <div className="flex items-center gap-2 text-sm mt-1 text-slate-700 font-medium">
                          <BookOpen className="h-3 w-3" /> {student.program_name}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{student.department}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
