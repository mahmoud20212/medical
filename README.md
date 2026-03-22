# موقع أرشفة كلية الطب البشري - Next.js

مشروع Next.js 14 جاهز للتطوير. يستخدم بيانات تجريبية بدون backend.

## المتطلبات
- Node.js 18+
- npm أو yarn أو pnpm

## التثبيت والتشغيل

```bash
# تثبيت المكتبات
npm install

# تشغيل المشروع في وضع التطوير
npm run dev
```

قبل التشغيل لأول مرة مع قاعدة البيانات:

```bash
# انسخ ملف البيئة
cp .env.example .env

# طبّق المايجريشن وأنشئ Prisma Client
npx prisma migrate dev -n add_auth_models
```

ثم افتح المتصفح على: http://localhost:3000

## هيكل المشروع

```
├── app/
│   ├── layout.tsx          # Layout الرئيسي
│   ├── globals.css         # CSS العام
│   ├── page.tsx            # الصفحة الرئيسية
│   ├── courses/
│   │   └── page.tsx        # صفحة المساقات مع الفلاتر
│   └── admin/
│       └── page.tsx        # لوحة التحكم
├── components/
│   └── Layout.tsx          # مكون التخطيط (Header + Footer)
├── lib/
│   ├── mockData.ts         # البيانات التجريبية (استبدلها بـ API)
│   └── utils.ts            # دوال مساعدة
└── public/
    └── images/             # ضع هنا شعار الكلية والدفعة
```

## تخصيص الشعارات

في ملف `app/page.tsx`، ابحث عن التعليقات:
```tsx
{/* Replace with: <Image src="/images/logo-college.png" ... /> */}
```
ضع صورة الشعار في مجلد `public/images/` وغيّر الكود.

## كلمة مرور الإدارة
تم استبدال كلمة المرور الثابتة بنظام مصادقة فعلي.

- يمكنك إنشاء حساب من صفحة الإدارة.
- تسجيل الدخول يدعم: البريد الإلكتروني أو اسم المستخدم + كلمة المرور.

## ربط البيانات الحقيقية

لاستبدال البيانات التجريبية بـ API حقيقي:
1. أنشئ API routes في مجلد `app/api/`
2. استبدل استخدام `mockData.ts` بـ fetch calls في الصفحات
