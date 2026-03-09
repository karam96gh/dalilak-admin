# Admin Dashboard - دليل الاستخدام الشامل

## 🎯 نظرة عامة

لوحة التحكم الإدارية لتطبيق **دليلك** - نظام إدارة شامل مبني بأحدث التقنيات.

**الحالة:** ✅ مكتملة 100% وجاهزة للإنتاج

---

## 📋 المتطلبات

- Node.js 18+
- npm أو yarn
- Backend Server يعمل على `localhost:1996`

---

## 🚀 التشغيل السريع

### 1. التثبيت

```bash
cd admin
npm install
```

### 2. إعداد البيئة

```bash
cp .env.example .env.local
```

**محتوى `.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:1996/api/v1
NEXT_PUBLIC_APP_NAME=دليلك - لوحة التحكم
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. تشغيل وضع التطوير

```bash
npm run dev
```

الموقع: [http://localhost:3000](http://localhost:3000)

---

## 🔐 المصادقة

### بيانات الدخول الافتراضية

```
اسم المستخدم: admin
كلمة المرور: Admin123!@
```

### التدفق الأمني

```
1. إدخال بيانات المستخدم
   ↓
2. تحقق من الصحة (Zod)
   ↓
3. إرسال لـ /admin/auth/login
   ↓
4. استقبال JWT Token
   ↓
5. حفظ في localStorage
   ↓
6. إضافة إلى جميع الطلبات
   ↓
7. تجديد تلقائي عند انتهاء الصلاحية
```

---

## 📊 الصفحات الرئيسية

### 🏠 لوحة التحكم
- عرض الإحصائيات الكلية
- عدد الإدخالات والأقسام والإعلانات
- آخر الأنشطة

**المسار:** `/`

### 📁 إدارة الأقسام
- عرض جميع الأقسام بشكل هرمي (3 مستويات)
- إضافة/تحديث/حذف أقسام
- رفع أيقونة وصورة
- إدارة الفئات الفرعية

**المسار:** `/categories`

**العمليات:**
```bash
GET    /admin/categories              # جميع الأقسام
POST   /admin/categories              # إنشاء قسم
PUT    /admin/categories/:id          # تحديث قسم
DELETE /admin/categories/:id          # حذف قسم
```

### 🏪 إدارة الإدخالات
- عرض جميع الإدخالات
- إضافة/تحديث/حذف إدخالات
- رفع صور متعددة (حتى 10)
- فلترة حسب: الحالة، المحافظة، المميزة
- البحث بالنص

**المسار:** `/listings`

**العمليات:**
```bash
GET    /admin/listings              # جميع الإدخالات
POST   /admin/listings              # إنشاء إدخال
PUT    /admin/listings/:id          # تحديث إدخال
DELETE /admin/listings/:id          # حذف إدخال
POST   /admin/upload/images         # رفع صور
DELETE /admin/listings/:id/images   # حذف صورة
```

### 🗺️ إدارة المحافظات
- عرض جميع المحافظات السورية (14)
- إضافة/تحديث/حذف محافظات
- ترتيب مخصص

**المسار:** `/governorates`

**العمليات:**
```bash
GET    /admin/governorates         # جميع المحافظات
POST   /admin/governorates         # إنشاء محافظة
PUT    /admin/governorates/:id     # تحديث محافظة
DELETE /admin/governorates/:id     # حذف محافظة
```

### 📣 إدارة الإعلانات
- عرض جميع الإعلانات
- إضافة/تحديث/حذف إعلانات
- رفع صور الإعلانات
- ترتيب مخصص
- تواريخ البدء والنهاية

**المسار:** `/ads`

**العمليات:**
```bash
GET    /admin/ads                  # جميع الإعلانات
POST   /admin/ads                  # إنشاء إعلان
PUT    /admin/ads/:id              # تحديث إعلان
DELETE /admin/ads/:id              # حذف إعلان
POST   /admin/ads/reorder          # إعادة ترتيب
```

### 🔔 إدارة الإشعارات
- عرض جميع الإشعارات مع Pagination
- إضافة/تحديث/حذف إشعارات
- 15 إشعار لكل صفحة

**المسار:** `/notifications`

**العمليات:**
```bash
GET    /admin/notifications              # جميع الإشعارات
POST   /admin/notifications              # إنشاء إشعار
PUT    /admin/notifications/:id          # تحديث إشعار
DELETE /admin/notifications/:id          # حذف إشعار
```

### ⚙️ الإعدادات
- معلومات الحساب الحالي
- معلومات الخادم والنظام
- إحصائيات قاعدة البيانات

**المسار:** `/settings`

---

## 🎨 واجهة المستخدم

### المكونات المستخدمة

- **Radix UI** - مكونات أساسية
- **Tailwind CSS** - الأنماط
- **Lucide Icons** - الأيقونات
- **React Hook Form** - إدارة النماذج
- **Zod** - التحقق من الصحة

### الألوان الأساسية

```css
Primary:   Blue (#3B82F6)
Success:   Green (#10B981)
Warning:   Orange (#F59E0B)
Danger:    Red (#EF4444)
Dark:      Slate (#0F172A)
```

---

## 🔧 البناء والنشر

### بناء للإنتاج

```bash
npm run build
```

### تشغيل الإنتاج

```bash
npm run start
```

### الخوادم الموصى بها

- Vercel (مدعوم تماماً)
- Netlify
- AWS Amplify
- DigitalOcean
- Heroku

---

## 🛠️ الهيكل المعماري

```
admin/
├── public/                      # الملفات الثابتة
│   └── fonts/                  # الخطوط
├── src/
│   ├── app/
│   │   ├── layout.tsx          # التخطيط العام
│   │   ├── globals.css         # الأنماط العامة
│   │   ├── (auth)/             # مجموعة المصادقة
│   │   │   └── login/
│   │   └── (dashboard)/        # مجموعة لوحة التحكم
│   │       ├── page.tsx        # الصفحة الرئيسية
│   │       ├── layout.tsx      # تخطيط لوحة التحكم
│   │       ├── categories/
│   │       ├── listings/
│   │       ├── ads/
│   │       ├── governorates/
│   │       ├── notifications/
│   │       └── settings/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileSidebar.tsx
│   │   └── ui/                 # مكونات Radix UI
│   ├── lib/
│   │   ├── api.ts              # HTTP Client
│   │   ├── auth.ts             # State Management
│   │   └── utils.ts            # دوال مساعدة
│   └── hooks/
│       └── use-toast.ts        # Hook الإشعارات
├── .env.example
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

---

## 🔌 التكامل مع API

### إعدادات الاتصال

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1996/api/v1',
});

// يتم إضافة JWT تلقائياً
// يتم معالجة الأخطاء تلقائياً
```

### مثال على طلب

```typescript
// جلب البيانات
const data = await api.get("/admin/categories");

// إرسال البيانات
const result = await api.post("/admin/listings", {
  name: "متجر جديد",
  description: "وصف المتجر"
});

// تحديث البيانات
await api.put(`/admin/listings/${id}`, updatedData);

// حذف البيانات
await api.delete(`/admin/listings/${id}`);
```

---

## 🧪 الاختبار

### اختبار الصفحات

```bash
# التحقق من عدم وجود أخطاء TypeScript
npm run build

# فحص الكود بـ ESLint
npm run lint
```

### اختبار اليد

1. **اختبر المصادقة:**
   - سجل دخول صحيح
   - سجل دخول خاطئ
   - انتهاء الجلسة

2. **اختبر CRUD:**
   - إنشاء عنصر جديد
   - تحديث العنصر
   - حذف العنصر
   - عرض القائمة

3. **اختبر رفع الملفات:**
   - رفع صورة واحدة
   - رفع صور متعددة
   - حذف صورة

4. **اختبر الفلترة والبحث:**
   - فلترة حسب الحالة
   - فلترة حسب المحافظة
   - البحث بالنص

---

## 🐛 استكشاف الأخطاء

### المشكلة: 401 Unauthorized

**السبب:** انتهاء صلاحية التوكن

**الحل:**
```bash
# امسح localStorage
localStorage.clear()
# أعد تحميل الصفحة وسجل دخول مجدداً
```

### المشكلة: لا يمكن الوصول إلى Backend

**السبب:** Backend غير مشغل أو URL خاطئ

**الحل:**
```bash
# تأكد أن Backend يعمل على:
http://localhost:1996

# تحقق من ملف البيئة
cat .env.local
```

### المشكلة: صور غير محملة

**السبب:** مسار API للصور خاطئ

**الحل:**
```typescript
// تحقق من دالة getImageUrl في كل صفحة
function getImageUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return API_BASE + url;
}
```

---

## 📚 المراجع

- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

## 📞 الدعم

للمساعدة والاستفسارات:
- راجع الأخطاء في Console
- تحقق من Network Tab في DevTools
- اطلب المساعدة من فريق التطوير

---

**آخر تحديث:** 1 مارس 2026  
**الإصدار:** 1.0.0  
**الحالة:** ✅ جاهز للإنتاج
