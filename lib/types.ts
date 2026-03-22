export type CourseType = "basic" | "clinical";

export type CourseFileType = "pdf" | "doc" | "ppt" | "video" | "link";

export interface CourseFile {
  id: number;
  courseId: number;
  name: string;
  url: string;
  fileType: CourseFileType;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  year: number;
  semester: string;
  type: CourseType;
  createdAt: string;
  updatedAt: string;
  files?: CourseFile[];
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
