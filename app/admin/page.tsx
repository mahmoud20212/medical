'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  FileUp,
  Search,
  Pencil,
  X,
  FolderKanban,
  Users,
  Microscope,
  Stethoscope,
  LogOut,
  UserPlus,
} from 'lucide-react';
import Layout from '@/components/Layout';
import type { Course, TeamMember, CourseFile } from '@/lib/types';

type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type ToastKind = 'success' | 'error';

type ToastMessage = {
  id: number;
  kind: ToastKind;
  message: string;
};

type AuthUser = {
  id: number;
  username: string;
  email: string;
};

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });

        if (!response.ok) {
          setIsAuthenticated(false);
          setAuthUser(null);
          return;
        }

        const data = (await response.json()) as { user: AuthUser | null };
        setIsAuthenticated(Boolean(data.user));
        setAuthUser(data.user);
      } catch {
        setIsAuthenticated(false);
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    void loadSession();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = { identifier: identifier.trim(), password };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { user?: AuthUser; error?: string };

      if (!response.ok) {
        setError(data.error || 'فشل تسجيل الدخول.');
        return;
      }

      if (data.user) {
        setAuthUser(data.user);
      }

      setIsAuthenticated(true);
      setPassword('');
      setIdentifier('');
      setError('');
    } catch {
      setError('تعذر إتمام عملية المصادقة.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setIsAuthenticated(false);
    setAuthUser(null);
    setPassword('');
    setIdentifier('');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-border text-center text-muted-foreground">
          جاري التحقق من الجلسة...
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-border">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-8">تسجيل الدخول للإدارة</h2>
          <form onSubmit={handleAuthSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">البريد الإلكتروني أو اسم المستخدم</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-left"
                dir="ltr"
                placeholder="name@example.com أو username"
              />
            </div>
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
        </div>
      </Layout>
    );
  }

  return <AdminDashboard authUser={authUser} onLogout={handleLogout} />;
}

function AdminDashboard({ authUser, onLogout }: { authUser: AuthUser | null; onLogout: () => Promise<void> }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'team'>('courses');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const notify = (kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <Layout>
      <ToastHost toasts={toasts} />
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة محتوى المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground hidden md:block">
            {authUser ? `مرحباً، ${authUser.username}` : ''}
          </div>
          {/* <button
            onClick={() => setIsAddingUser(true)}
            className="px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم
          </button> */}
          <button
            onClick={() => void onLogout()}
            className="px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
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
      </div>

      {isAddingUser && (
        <CreateUserModal
          onClose={() => setIsAddingUser(false)}
          onSuccess={(message) => {
            notify('success', message);
            setIsAddingUser(false);
          }}
          onError={(message) => {
            notify('error', message);
          }}
        />
      )}

      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'courses' ? <CoursesManager onNotify={notify} /> : <TeamManager onNotify={notify} />}
      </div>
    </Layout>
  );
}

function CreateUserModal({
  onClose,
  onSuccess,
  onError,
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      onError('يرجى تعبئة جميع الحقول.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        onError(data.error || 'تعذر إنشاء المستخدم.');
        return;
      }

      onSuccess('تم إنشاء المستخدم بنجاح.');
    } catch {
      onError('تعذر إنشاء المستخدم.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold mb-6">إضافة مستخدم جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">اسم المستخدم</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              dir="ltr"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              dir="ltr"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
              dir="ltr"
              placeholder="********"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? 'جارٍ الإنشاء...' : 'إنشاء المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToastHost({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed top-4 left-4 z-[70] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[240px] max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function CoursesManager({ onNotify }: { onNotify: (kind: ToastKind, message: string) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'latest' | 'name' | 'year'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [managingFilesFor, setManagingFilesFor] = useState<number | null>(null);

  const loadCourses = async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '8',
      includeFiles: 'false',
    });

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    params.set('sort', sort);

    const response = await fetch(`/api/courses?${params.toString()}`, { cache: 'no-store' });
    const data = (await response.json()) as PaginatedResponse<Course>;
    const normalized: Course[] = data.items.map((course: Course) => ({
      ...course,
      description: course.description || '',
    }));

    setCourses(normalized);
    setTotalPages(data.pagination.totalPages);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await loadCourses();
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [searchQuery, sort, page]);

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المساق؟')) {
      await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      await loadCourses();
      onNotify('success', 'تم حذف المساق بنجاح.');
    }
  };

  const handleAdd = async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'تعذر إضافة المساق.';
      try {
        const text = await response.text();
        const payload = text ? (JSON.parse(text) as { error?: string }) : null;
        errorMessage = payload?.error || errorMessage;
      } catch {
        // Ignore parse errors and keep fallback message.
      }

      onNotify('error', errorMessage);
      return;
    }

    setPage(1);
    await loadCourses();
    setIsAdding(false);
    onNotify('success', 'تمت إضافة المساق بنجاح.');
  };

  const handleUpdate = async (id: number, data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      onNotify('error', 'تعذر تعديل المساق.');
      return;
    }

    await loadCourses();
    setEditingCourse(null);
    onNotify('success', 'تم تعديل المساق بنجاح.');
  };

  return (
    <div className="p-6">
      <div className="md:flex flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-3 md:mb-0">المساقات المسجلة</h2>
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as 'latest' | 'name' | 'year');
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
          >
            <option value="latest">الأحدث</option>
            <option value="name">الاسم</option>
            <option value="year">السنة</option>
          </select>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="بحث عن مساق..."
              className="pr-9 pl-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            إضافة مساق
          </button>
        </div>
      </div>

      {isAdding && <AddCourseModal onClose={() => setIsAdding(false)} onAdd={handleAdd} />}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleUpdate}
        />
      )}
      {managingFilesFor && (
        <ManageFilesModal
          courseId={managingFilesFor}
          courseName={courses.find((c) => c.id === managingFilesFor)?.name || ''}
          onClose={() => setManagingFilesFor(null)}
          onNotify={onNotify}
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
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري تحميل المساقات...</td></tr>
            ) : courses.length === 0 ? (
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
                        onClick={() => setEditingCourse(course)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-amber-200"
                      >
                        <Pencil className="w-4 h-4" />
                        تعديل
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

      <div className="flex items-center justify-center gap-3 mt-5">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>
        <span className="text-sm text-muted-foreground">الصفحة {page} من {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          التالي
        </button>
      </div>
    </div>
  );
}

function AddCourseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: '', description: '', year: 1, semester: 'الأول', type: 'basic' as 'basic' | 'clinical' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onAdd(form);
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

function EditCourseModal({
  course,
  onClose,
  onSave,
}: {
  course: Course;
  onClose: () => void;
  onSave: (id: number, data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: course.name,
    description: course.description || '',
    year: course.year,
    semester: course.semester,
    type: course.type,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSave(course.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold mb-6">تعديل المساق</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">اسم المساق *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border focus:border-primary outline-none"
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
              حفظ التعديل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageFilesModal({
  courseId,
  courseName,
  onClose,
  onNotify,
}: {
  courseId: number;
  courseName: string;
  onClose: () => void;
  onNotify: (kind: ToastKind, message: string) => void;
}) {
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'latest' | 'name'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingFile, setEditingFile] = useState<CourseFile | null>(null);
  const [form, setForm] = useState({ name: '', url: '', fileType: 'pdf' });

  const loadFiles = async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '5',
    });

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    params.set('sort', sort);

    const response = await fetch(`/api/courses/${courseId}/files?${params.toString()}`, { cache: 'no-store' });
    const data = (await response.json()) as PaginatedResponse<CourseFile>;
    setFiles(data.items);
    setTotalPages(data.pagination.totalPages);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadFiles();
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [courseId, searchQuery, sort, page]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url) return;

    const response = await fetch(`/api/courses/${courseId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      onNotify('error', 'تعذر إضافة الملف.');
      return;
    }

    setPage(1);
    await loadFiles();
    setForm({ name: '', url: '', fileType: 'pdf' });
    onNotify('success', 'تمت إضافة الملف بنجاح.');
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/files/${id}`, {
      method: 'DELETE',
    });
    await loadFiles();
    onNotify('success', 'تم حذف الملف بنجاح.');
  };

  const handleUpdate = async (id: number, data: Pick<CourseFile, 'name' | 'url' | 'fileType'>) => {
    const response = await fetch(`/api/files/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      onNotify('error', 'تعذر تعديل الملف.');
      return;
    }

    await loadFiles();
    setEditingFile(null);
    onNotify('success', 'تم تعديل الملف بنجاح.');
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
        {editingFile && (
          <EditFileModal
            file={editingFile}
            onClose={() => setEditingFile(null)}
            onSave={handleUpdate}
          />
        )}
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
            <div className="mb-4">
              <h4 className="font-bold mb-3">الملفات الحالية</h4>
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as 'latest' | 'name');
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
                >
                  <option value="latest">الأحدث</option>
                  <option value="name">الاسم</option>
                </select>
                <div className="relative w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="بحث ملف..."
                    className="w-full pr-9 pl-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground text-sm">جاري تحميل الملفات...</p>
              ) : files.length === 0 ? (
                <p className="text-muted-foreground text-sm">لا توجد ملفات</p>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl shadow-sm">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 uppercase">{file.fileType}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingFile(file)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(file.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditFileModal({
  file,
  onClose,
  onSave,
}: {
  file: CourseFile;
  onClose: () => void;
  onSave: (id: number, data: Pick<CourseFile, 'name' | 'url' | 'fileType'>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: file.name,
    url: file.url,
    fileType: file.fileType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    await onSave(file.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-5">تعديل الملف</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">اسم الملف</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">الرابط</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              dir="ltr"
              className="w-full text-left px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">نوع الملف</label>
            <select
              value={form.fileType}
              onChange={(e) => setForm({ ...form, fileType: e.target.value as CourseFile['fileType'] })}
              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary outline-none"
            >
              <option value="pdf">PDF</option>
              <option value="doc">Word / Text</option>
              <option value="ppt">PowerPoint</option>
              <option value="video">Video</option>
              <option value="link">External Link</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-bold text-muted-foreground hover:bg-secondary">إلغاء</button>
            <button type="submit" className="px-5 py-2 rounded-lg font-bold bg-primary text-white hover:bg-primary/90">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamManager({ onNotify }: { onNotify: (kind: ToastKind, message: string) => void }) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'latest' | 'name'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: '', role: '' });

  const loadTeam = async () => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '8',
    });

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    params.set('sort', sort);

    const response = await fetch(`/api/team?${params.toString()}`, { cache: 'no-store' });
    const data = (await response.json()) as PaginatedResponse<TeamMember>;
    setTeam(data.items);
    setTotalPages(data.pagination.totalPages);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadTeam();
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [searchQuery, sort, page]);

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف العضو؟')) {
      await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      });
      await loadTeam();
      onNotify('success', 'تم حذف العضو بنجاح.');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;

    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      onNotify('error', 'تعذر إضافة العضو.');
      return;
    }

    setPage(1);
    await loadTeam();
    setForm({ name: '', role: '' });
    setIsAdding(false);
    onNotify('success', 'تمت إضافة العضو بنجاح.');
  };

  const handleUpdate = async (id: number, data: Pick<TeamMember, 'name' | 'role'>) => {
    const response = await fetch(`/api/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      onNotify('error', 'تعذر تعديل بيانات العضو.');
      return;
    }

    await loadTeam();
    setEditingMember(null);
    onNotify('success', 'تم تعديل بيانات العضو بنجاح.');
  };

  return (
    <div className="p-6">
      <div className="md:flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold mb-3">أعضاء الفريق</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as 'latest' | 'name');
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
          >
            <option value="latest">الأحدث</option>
            <option value="name">الاسم</option>
          </select>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="بحث عضو..."
              className="pr-9 pl-3 py-2 rounded-lg border border-border outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            إضافة عضو
          </button>
        </div>
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
      {editingMember && (
        <EditTeamModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdate}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="p-4 rounded-tr-xl font-semibold">الاسم</th>
              <th className="p-4 font-semibold">الدور / المهمة</th>
              <th className="p-4 rounded-tl-xl font-semibold w-56">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">جاري تحميل الفريق...</td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">لا يوجد أعضاء</td></tr>
            ) : (
              team.map((member) => (
                <tr key={member.id} className="border-b border-border hover:bg-secondary/20">
                  <td className="p-4 font-bold text-foreground">{member.name}</td>
                  <td className="p-4">{member.role}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-amber-200"
                      >
                        <Pencil className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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

      <div className="flex items-center justify-center gap-3 mt-5">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>
        <span className="text-sm text-muted-foreground">الصفحة {page} من {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          التالي
        </button>
      </div>
    </div>
  );
}

function EditTeamModal({
  member,
  onClose,
  onSave,
}: {
  member: TeamMember;
  onClose: () => void;
  onSave: (id: number, data: Pick<TeamMember, 'name' | 'role'>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: member.name,
    role: member.role,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    await onSave(member.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-secondary rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold mb-6">تعديل بيانات عضو</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary">إلغاء</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-lg hover:bg-primary/90">حفظ التعديل</button>
          </div>
        </form>
      </div>
    </div>
  );
}
