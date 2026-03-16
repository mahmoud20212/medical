'use client';

import { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  FileUp,
  X,
  FolderKanban,
  Users,
  Microscope,
  Stethoscope,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { mockCourses, mockTeam, mockFiles, type Course, type TeamMember, type CourseFile } from '@/lib/mockData';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور خاطئة');
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-border">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-8">تسجيل الدخول للإدارة</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-left"
                dir="ltr"
                placeholder="أدخل كلمة المرور"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              دخول
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">كلمة المرور التجريبية: admin123</p>
        </div>
      </Layout>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'courses' | 'team'>('courses');

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة محتوى المنصة (بيانات تجريبية)</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
              activeTab === 'courses' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderKanban className="w-5 h-5" />
            المساقات
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
              activeTab === 'team' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-5 h-5" />
            الفريق
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'courses' ? <CoursesManager /> : <TeamManager />}
      </div>
    </Layout>
  );
}

function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isAdding, setIsAdding] = useState(false);
  const [managingFilesFor, setManagingFilesFor] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المساق؟')) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleAdd = (data: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    setCourses((prev) => [...prev, newCourse]);
    setIsAdding(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">المساقات المسجلة</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          إضافة مساق
        </button>
      </div>

      {isAdding && <AddCourseModal onClose={() => setIsAdding(false)} onAdd={handleAdd} />}
      {managingFilesFor && (
        <ManageFilesModal
          courseId={managingFilesFor}
          courseName={courses.find((c) => c.id === managingFilesFor)?.name || ''}
          onClose={() => setManagingFilesFor(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="p-4 rounded-tr-xl font-semibold">المساق</th>
              <th className="p-4 font-semibold">النوع</th>
              <th className="p-4 font-semibold">السنة</th>
              <th className="p-4 font-semibold">الفصل</th>
              <th className="p-4 rounded-tl-xl font-semibold w-64">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا يوجد مساقات</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="p-4 font-bold text-foreground">{course.name}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                      course.type === 'basic' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {course.type === 'basic' ? <Microscope className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
                      {course.type === 'basic' ? 'Basic' : 'Clinical'}
                    </span>
                  </td>
                  <td className="p-4">{course.year}</td>
                  <td className="p-4">{course.semester}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setManagingFilesFor(course.id)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-200"
                      >
                        <FileUp className="w-4 h-4" />
                        الملفات
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddCourseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<Course, 'id' | 'createdAt'>) => void;
}) {
  const [form, setForm] = useState({ name: '', description: '', year: 1, semester: 'الأول', type: 'basic' as 'basic' | 'clinical' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold mb-6">إضافة مساق جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">اسم المساق *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              placeholder="مثال: علم التشريح"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">نوع المساق</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'basic' | 'clinical' })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
            >
              <option value="basic">Basic Sciences (أساسية)</option>
              <option value="clinical">Clinical Sciences (سريرية)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">السنة الدراسية</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">الفصل</label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              >
                <option value="الأول">الأول</option>
                <option value="الثاني">الثاني</option>
                <option value="صيفي">صيفي</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary">
              إلغاء
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg hover:bg-primary/90">
              حفظ المساق
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageFilesModal({ courseId, courseName, onClose }: { courseId: number; courseName: string; onClose: () => void }) {
  const [files, setFiles] = useState<CourseFile[]>(mockFiles.filter((f) => f.courseId === courseId));
  const [form, setForm] = useState({ name: '', url: '', fileType: 'pdf' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    const newFile: CourseFile = {
      id: Date.now(),
      courseId,
      name: form.name,
      url: form.url,
      fileType: form.fileType as CourseFile['fileType'],
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [...prev, newFile]);
    setForm({ name: '', url: '', fileType: 'pdf' });
  };

  const handleDelete = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">إدارة ملفات المساق</h3>
            <p className="text-primary font-semibold mt-1">{courseName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">
          <div className="bg-secondary/30 p-5 rounded-2xl border border-border h-fit">
            <h4 className="font-bold mb-4">إضافة ملف جديد</h4>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">اسم الملف</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: المحاضرة الأولى"
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">الرابط (URL)</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full text-left px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">نوع الملف</label>
                <select
                  value={form.fileType}
                  onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Word / Text</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="video">Video</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">
                رفع الملف
              </button>
            </form>
          </div>
          <div>
            <h4 className="font-bold mb-4">الملفات الحالية</h4>
            <div className="space-y-3">
              {files.length === 0 ? (
                <p className="text-muted-foreground text-sm">لا توجد ملفات</p>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl shadow-sm">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 uppercase">{file.fileType}</p>
                    </div>
                    <button onClick={() => handleDelete(file.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', role: '' });

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف العضو؟')) {
      setTeam((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    setTeam((prev) => [...prev, { id: Date.now(), ...form }]);
    setForm({ name: '', role: '' });
    setIsAdding(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">أعضاء الفريق</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          إضافة عضو
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold mb-6">إضافة عضو جديد</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">الاسم الكامل</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">الدور</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
                  placeholder="مثال: مطور، مدير المحتوى"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary">إلغاء</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg hover:bg-primary/90">إضافة عضو</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="p-4 rounded-tr-xl font-semibold">الاسم</th>
              <th className="p-4 font-semibold">الدور / المهمة</th>
              <th className="p-4 rounded-tl-xl font-semibold w-32">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {team.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">لا يوجد أعضاء</td></tr>
            ) : (
              team.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="p-4 font-bold text-foreground">{member.name}</td>
                  <td className="p-4">{member.role}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
