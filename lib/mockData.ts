export type CourseType = 'basic' | 'clinical';

export interface Course {
  id: number;
  name: string;
  description: string;
  year: number;
  semester: string;
  type: CourseType;
  createdAt: string;
}

export interface CourseFile {
  id: number;
  courseId: number;
  name: string;
  url: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'video' | 'link';
  uploadedAt: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
}

export const mockCourses: Course[] = [
  {
    id: 1,
    name: 'علم التشريح',
    description: 'دراسة تفصيلية لتشريح جسم الإنسان من الناحية الوصفية والوظيفية',
    year: 1,
    semester: 'الأول',
    type: 'basic',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'علم وظائف الأعضاء',
    description: 'دراسة وظائف الأجهزة الحيوية في جسم الإنسان',
    year: 1,
    semester: 'الثاني',
    type: 'basic',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'الكيمياء الحيوية',
    description: 'دراسة التفاعلات الكيميائية في الكائنات الحية',
    year: 1,
    semester: 'الأول',
    type: 'basic',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'علم الأمراض',
    description: 'دراسة أسباب الأمراض وآليات حدوثها',
    year: 2,
    semester: 'الأول',
    type: 'basic',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 5,
    name: 'الأمراض الداخلية',
    description: 'تشخيص وعلاج أمراض الأجهزة الداخلية',
    year: 3,
    semester: 'الأول',
    type: 'clinical',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 6,
    name: 'الجراحة العامة',
    description: 'مبادئ الجراحة وأسسها العملية والنظرية',
    year: 3,
    semester: 'الثاني',
    type: 'clinical',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 7,
    name: 'طب الأطفال',
    description: 'تشخيص وعلاج أمراض الأطفال',
    year: 4,
    semester: 'الأول',
    type: 'clinical',
    createdAt: '2024-09-01T00:00:00Z',
  },
  {
    id: 8,
    name: 'طب النساء والتوليد',
    description: 'رعاية صحة المرأة والحمل والولادة',
    year: 4,
    semester: 'الثاني',
    type: 'clinical',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

export const mockFiles: CourseFile[] = [
  { id: 1, courseId: 1, name: 'محاضرة 1 - مقدمة في التشريح', url: '#', fileType: 'pdf', uploadedAt: '2024-09-10T00:00:00Z' },
  { id: 2, courseId: 1, name: 'محاضرة 2 - الجهاز العظمي', url: '#', fileType: 'ppt', uploadedAt: '2024-09-17T00:00:00Z' },
  { id: 3, courseId: 1, name: 'فيديو شرح الأطراف', url: '#', fileType: 'video', uploadedAt: '2024-09-20T00:00:00Z' },
  { id: 4, courseId: 2, name: 'محاضرة 1 - فسيولوجيا القلب', url: '#', fileType: 'pdf', uploadedAt: '2024-09-10T00:00:00Z' },
  { id: 5, courseId: 5, name: 'ملخص الأمراض الداخلية', url: '#', fileType: 'doc', uploadedAt: '2024-10-01T00:00:00Z' },
  { id: 6, courseId: 6, name: 'دليل الجراحة - الجزء الأول', url: '#', fileType: 'pdf', uploadedAt: '2024-10-05T00:00:00Z' },
];

export const mockTeam: TeamMember[] = [
  { id: 1, name: 'محمد أحمد', role: 'مطور الموقع' },
  { id: 2, name: 'سارة خالد', role: 'مديرة المحتوى' },
  { id: 3, name: 'عمر حسن', role: 'مصمم الجرافيك' },
  { id: 4, name: 'ليلى يوسف', role: 'منسقة المساقات' },
];
