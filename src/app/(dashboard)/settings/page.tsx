"use client";

import { useAuthStore } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Server, Database, Shield } from "lucide-react";

export default function SettingsPage() {
  const { admin } = useAuthStore();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">الإعدادات</h2>
        <p className="text-slate-500 mt-1">معلومات النظام والحساب</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>بيانات المدير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">الاسم الكامل</span>
              <span className="font-medium">{admin?.name || "—"}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">اسم المستخدم</span>
              <span className="font-medium font-mono">{admin?.username || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">الصلاحية</span>
              <Badge>مدير النظام</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Server className="h-5 w-5 text-green-700" />
            </div>
            <CardTitle>معلومات الخادم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">عنوان API</span>
              <span className="font-mono text-xs">{
                process.env.NEXT_PUBLIC_API_BASE_URL?.replace('http://', '').replace('https://', '').replace('/api/v1', '') ||
                'localhost:1996'
              }</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">إصدار API</span>
              <span className="font-mono text-xs">v1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">حالة الاتصال</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">متصل</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Database className="h-5 w-5 text-violet-700" />
            </div>
            <CardTitle>معلومات قاعدة البيانات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">النوع</span>
              <span className="font-medium">MySQL</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">ORM</span>
              <span className="font-medium">Prisma</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">قاعدة البيانات</span>
              <span className="font-mono text-xs">dalilak</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-5 w-5 text-orange-700" />
            </div>
            <CardTitle>الأمان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">نوع المصادقة</span>
              <span className="font-medium">JWT</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-sm text-muted-foreground">مدة الجلسة</span>
              <span className="font-medium">24 ساعة</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">تشفير كلمات المرور</span>
              <span className="font-medium">bcrypt</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
