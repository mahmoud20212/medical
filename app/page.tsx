'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockTeam } from '@/lib/mockData';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#0f3460] text-white p-8 md:p-16 mb-16 shadow-2xl shadow-primary/20">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit text-sm font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>أهلاً بكم في المستقبل الطبي</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.2]">
              المكتبة الرقمية لكلية الطب البشري
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-lg">
              منصة متكاملة للوصول إلى كافة المساقات الدراسية، المحاضرات، والمراجع العلمية لدعم رحلتك في تعلم الطب.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                href="/courses"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                تصفح المساقات
              </Link>
            </div>
          </div>

          <div className="flex justify-center md:justify-end gap-6">
            {/* College Logo Placeholder */}
            <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl p-4 shadow-2xl rotate-[-6deg] hover:rotate-0 transition-transform duration-300 flex items-center justify-center">
              <div className="text-center text-primary">
                {/* Replace with: <Image src="/images/logo-college.png" alt="شعار الكلية" width={200} height={200} className="object-contain" /> */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-12 h-12 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary/70">شعار الكلية</p>
              </div>
            </div>
            {/* Batch Logo Placeholder */}
            <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl p-4 shadow-2xl rotate-[6deg] hover:rotate-0 transition-transform duration-300 translate-y-8 flex items-center justify-center">
              <div className="text-center text-primary">
                {/* Replace with: <Image src="/images/logo-batch.png" alt="شعار الدفعة" width={200} height={200} className="object-contain" /> */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary/70">شعار الدفعة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            فريق العمل
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">الزملاء القائمون على تطوير وإدارة الموقع</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTeam.map((member, idx) => (
            <div
              key={member.id}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                <p className="text-accent font-medium mt-1 text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
