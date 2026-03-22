'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  FileText,
  FileIcon,
  Presentation,
  Video,
  Link as LinkIcon,
  Calendar,
  Layers,
  Search,
  Microscope,
  Stethoscope,
  X,
  ExternalLink,
} from 'lucide-react';
import Layout from '@/components/Layout';
import type { Course, CourseFile, CourseType } from '@/lib/types';
import { format } from 'date-fns';

type CoursesApiResponse = {
  items: Course[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type CoursesMetaResponse = {
  years: number[];
  semesters: string[];
  counts: {
    all: number;
    basic: number;
    clinical: number;
  };
};

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'doc': return <FileIcon className="w-5 h-5 text-blue-600" />;
    case 'ppt': return <Presentation className="w-5 h-5 text-orange-500" />;
    case 'video': return <Video className="w-5 h-5 text-purple-600" />;
    case 'link': return <LinkIcon className="w-5 h-5 text-emerald-600" />;
    default: return <FileIcon className="w-5 h-5 text-gray-500" />;
  }
};

function CourseFiles({ files }: { files: CourseFile[] }) {
  if (files.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground bg-secondary/50 rounded-xl m-4">
        لا توجد ملفات مرفقة لهذا المساق حتى الآن.
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-3">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/5 transition-colors">
              {getFileIcon(file.fileType)}
            </div>
            <div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {file.name}
              </h4>
              <span className="text-xs text-muted-foreground block mt-1">
                {format(new Date(file.uploadedAt), 'yyyy/MM/dd')}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      ))}
    </div>
  );
}

type ActiveCourseType = 'all' | CourseType;
type CourseSort = 'latest' | 'name' | 'year';
const PAGE_SIZE = 6;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<CoursesMetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<CourseSort>('year');
  const [activeType, setActiveType] = useState<ActiveCourseType>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await fetch('/api/courses/meta', { cache: 'no-store' });

        if (!response.ok) {
          setMeta({
            years: [],
            semesters: [],
            counts: { all: 0, basic: 0, clinical: 0 },
          });
          return;
        }

        const text = await response.text();
        const data = text ? (JSON.parse(text) as CoursesMetaResponse) : null;
        setMeta(
          data ?? {
            years: [],
            semesters: [],
            counts: { all: 0, basic: 0, clinical: 0 },
          }
        );
      } catch {
        setMeta({
          years: [],
          semesters: [],
          counts: { all: 0, basic: 0, clinical: 0 },
        });
      }
    };

    void loadMeta();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });

      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      params.set('sort', sort);
      if (activeType !== 'all') params.set('type', activeType);
      if (selectedYear !== 'all') params.set('year', selectedYear);
      if (selectedSemester !== 'all') params.set('semester', selectedSemester);

      try {
        const response = await fetch(`/api/courses?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) {
          setCourses([]);
          setTotalPages(1);
          setTotalItems(0);
          return;
        }

        const text = await response.text();
        const data = text
          ? (JSON.parse(text) as CoursesApiResponse)
          : {
              items: [],
              pagination: {
                page,
                pageSize: PAGE_SIZE,
                total: 0,
                totalPages: 1,
              },
            };

        const normalized: Course[] = data.items.map((course) => ({
          ...course,
          description: course.description || '',
        }));

        setCourses(normalized);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
      } catch {
        setCourses([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [searchQuery, sort, activeType, selectedYear, selectedSemester, page]);

  const availableYears = useMemo(() => meta?.years ?? [], [meta]);
  const availableSemesters = useMemo(() => meta?.semesters ?? [], [meta]);

  const typeCounts = meta?.counts ?? { all: 0, basic: 0, clinical: 0 };

  const hasActiveFilters = selectedYear !== 'all' || selectedSemester !== 'all' || searchQuery || activeType !== 'all';

  const clearFilters = () => {
    setActiveType('all');
    setSelectedYear('all');
    setSelectedSemester('all');
    setSearchQuery('');
    setSort('year');
    setPage(1);
  };

  const typeTabs = [
    {
      value: 'all' as ActiveCourseType,
      label: 'جميع المساقات',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      value: 'basic' as ActiveCourseType,
      label: 'Basic Sciences',
      icon: <Microscope className="w-5 h-5" />,
    },
    {
      value: 'clinical' as ActiveCourseType,
      label: 'Clinical Sciences',
      icon: <Stethoscope className="w-5 h-5" />,
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">جاري تحميل المساقات...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">المساقات الدراسية</h1>
        <p className="text-lg text-muted-foreground">
          تصفح كافة المساقات وحمل المحاضرات والمراجع الخاصة بكل مساق بسهولة.
        </p>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {typeTabs.map((tab) => {
          const isActive = activeType === tab.value;
          const count = tab.value === 'all' ? typeCounts.all : typeCounts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveType(tab.value);
                setExpandedCourse(null);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-200 border-2 ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-lg'
                  : 'bg-white text-foreground/70 border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-secondary'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 max-w-4xl mx-auto mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن مساق..."
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as CourseSort);
              setPage(1);
            }}
            className="px-4 py-3 rounded-xl border-2 bg-white border-border shadow-sm transition-all cursor-pointer font-medium outline-none"
          >
            <option value="year">الفرز حسب السنة</option>
            <option value="latest">الفرز حسب الأحدث</option>
            <option value="name">الفرز حسب الاسم</option>
          </select>
        </div>

        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPage(1);
            }}
            className={`pr-9 pl-4 py-3 rounded-xl border-2 bg-white shadow-sm transition-all cursor-pointer font-medium outline-none ${
              selectedYear !== 'all' ? 'border-primary text-primary' : 'border-border'
            }`}
          >
            <option value="all">كل السنوات</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                السنة {y}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setPage(1);
            }}
            className={`pr-9 pl-4 py-3 rounded-xl border-2 bg-white shadow-sm transition-all cursor-pointer font-medium outline-none ${
              selectedSemester !== 'all' ? 'border-primary text-primary' : 'border-border'
            }`}
          >
            <option value="all">كل الفصول</option>
            {availableSemesters.map((s) => (
              <option key={s} value={s}>
                الفصل {s}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-3 rounded-xl bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 font-medium transition-all"
          >
            <X className="w-4 h-4" />
            مسح
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto mb-4 text-sm text-muted-foreground">
        {totalItems} مساق
      </div>

      {/* Course List */}
      {courses.length > 0 ? (
        <div className="grid gap-5 max-w-4xl mx-auto">
          {courses.map((course) => {
            const isExpanded = expandedCourse === course.id;
            const isBasic = course.type === 'basic';

            return (
              <div
                key={course.id}
                className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'border-primary shadow-xl'
                    : 'border-border shadow-sm hover:border-primary/50 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="w-full text-right p-6 flex items-center justify-between cursor-pointer focus:outline-none"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{course.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                          isBasic ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isBasic ? <Microscope className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
                        {isBasic ? 'Basic' : 'Clinical'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        السنة {course.year}
                      </span>
                      <span className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                        <Layers className="w-3.5 h-3.5" />
                        الفصل {course.semester}
                      </span>
                    </div>
                    {course.description && (
                      <p className="mt-3 text-foreground/70 leading-relaxed text-sm">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 mr-4 ${
                      isExpanded ? 'bg-primary text-white rotate-180' : 'bg-secondary text-foreground'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-gray-50/50">
                    <CourseFiles files={course.files ?? []} />
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-border bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-sm text-muted-foreground">الصفحة {page} من {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg border border-border bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">لا توجد مساقات مطابقة</h3>
          <p className="text-muted-foreground mt-2">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
        </div>
      )}
    </Layout>
  );
}
