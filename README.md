# دليلك - لوحة تحكم الإدارة

لوحة تحكم إدارية شاملة لتطبيق دليلك. مبنية باستخدام Next.js 14، TypeScript، و Tailwind CSS.

## الميزات الرئيسية

- 🔐 **المصادقة**: تسجيل دخول آمن مع JWT
- 📊 **لوحة التحكم**: إحصائيات وتقارير شاملة
- 📂 **إدارة الأقسام**: دعم الأقسام الهرمية (3 مستويات)
- 📝 **إدارة الإدخالات**: CRUD مع دعم الصور المتعددة
- 🗺️ **إدارة المحافظات**: تحديث وترتيب المحافظات
- 📢 **إدارة الإعلانات**: مع دعم الترتيب المخصص والتواريخ
- 🔔 **إدارة الإشعارات**: إنشاء وتحديث الإشعارات مع pagination
- ⚙️ **الإعدادات**: معلومات النظام والحساب
- 🎨 **واجهة مستخدم**: تصميم عصري وسريع الاستجابة
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة

## البدء السريع

### المتطلبات
- Node.js 18+
- npm أو yarn

### التثبيت

```bash
# استنساخ المشروع
git clone <repo-url>
cd admin

# تثبيت الاعتماديات
npm install

# إنشاء ملف البيئة
cp .env.example .env.local

# تحديث NEXT_PUBLIC_API_BASE_URL إذا لزم الأمر
# NEXT_PUBLIC_API_BASE_URL=http://localhost:1996/api/v1
```

### تشغيل الخادم

```bash
# بيئة التطوير
npm run dev

# بيئة الإنتاج
npm run build
npm run start
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### بيانات الدخول

```
اسم المستخدم: admin
كلمة المرور: admin123
```

## الهيكل

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # صفحات المصادقة
│   │   ├── login/           # صفحة تسجيل الدخول
│   │   └── layout.tsx
│   ├── (dashboard)/         # نطاق لوحة التحكم
│   │   ├── page.tsx         # الرئيسية
│   │   ├── categories/      # إدارة الأقسام
│   │   ├── listings/        # إدارة الإدخالات
│   │   ├── governorates/    # إدارة المحافظات
│   │   ├── notifications/   # إدارة الإشعارات
│   │   ├── ads/             # إدارة الإعلانات
│   │   ├── settings/        # الإعدادات
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileSidebar.tsx
│   └── ui/                  # مكونات Shadcn/ui
├── lib/
│   ├── api.ts              # عميل Axios مع اعتراضات
│   ├── auth.ts             # متجر المصادقة (Zustand)
│   └── utils.ts
└── hooks/
    └── use-toast.ts
```

## المتغيرات البيئية

```env
# قاعدة URL للـ API
NEXT_PUBLIC_API_BASE_URL=http://localhost:1996/api/v1

# معلومات التطبيق
NEXT_PUBLIC_APP_NAME=دليلك - لوحة التحكم
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## التكنولوجيات المستخدمة

- **Next.js 14**: إطار العمل الأساسي
- **TypeScript**: أمان Type
- **Tailwind CSS**: تنسيقات CSS
- **React Hook Form**: إدارة النماذج
- **Zustand**: إدارة الحالة
- **Axios**: طلبات HTTP
- **Shadcn/ui**: مكونات UI منقحة
- **Zod**: التحقق من صحة البيانات

## الإدارة

### إضافة صفحة جديدة

```bash
mkdir -p src/app/\(dashboard\)/new-page
touch src/app/\(dashboard\)/new-page/page.tsx
```

### تنسيق صفحة

```typescript
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function NewPage() {
    const { token } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        
        const fetchData = async () => {
            try {
                const response = await api.get("/admin/endpoint");
                setData(response);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    return (
        <div>
            {loading ? <p>جاري التحميل...</p> : <p>{JSON.stringify(data)}</p>}
        </div>
    );
}
```

## اختبار الـ API

```bash
# الحصول على رمز المصادقة
token=$(curl -s -X POST http://localhost:1996/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# استخدام الرمز
curl -X GET http://localhost:1996/api/v1/admin/categories \
  -H "Authorization: Bearer $token"
```

## المشاكل الشائعة

### خطأ الاتصال بـ API
- تأكد من تشغيل الخادم الخلفي على المنفذ المتوقع
- تحقق من `NEXT_PUBLIC_API_BASE_URL` في `.env.local`

### مشاكل CORS
- تأكد من تفعيل CORS في الخادم الخلفي
- تحقق من عنوان الأصل المسموح به

## المساهمة

1. إنشاء فرع للميزة الجديدة
2. الالتزام بالتغييرات
3. دفع الفرع
4. إنشاء طلب دمج

## الترخيص

MIT
