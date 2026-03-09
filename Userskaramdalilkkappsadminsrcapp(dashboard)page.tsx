"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Tags, MapPin, Megaphone, TrendingUp, Activity, Star } from "lucide-react";

interface Stats {
    totalListings: number;
    activeListings: number;
    totalCategories: number;
    totalGovernorates: number;
    totalNotifications: number;
    totalAds: number;
    featuredListings: number;
    recentListings: Array<{
        id: number; name: string; viewCount: number;
        category: { id: number; name: string };
        governorate: { id: number; name: string };
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/stats")
            .then((data: any) => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">نظرة عامة</h2>
                <p className="text-slate-500 mt-1">إحصائيات المنصة وأحدث النشاطات</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإدخالات</CardTitle>
                        <div className="p-2 bg-pink-100 rounded-lg"><Building2 className="h-4 w-4 text-pink-700" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalListings || 0}</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />{stats?.activeListings || 0} نشط على المنصة
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الأقسام والفئات</CardTitle>
                        <div className="p-2 bg-violet-100 rounded-lg"><Tags className="h-4 w-4 text-violet-700" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">موزعة على 3 مستويات</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المحافظات المغطاة</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg"><MapPin className="h-4 w-4 text-orange-700" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalGovernorates || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">محافظة رئيسية</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإعلانات النشطة</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg"><Megaphone className="h-4 w-4 text-blue-700" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAds || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">إعلانات ممولة / بنرات</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary" />أحدث الإدخالات المضافة
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentListings?.map((listing) => (
                                <div key={listing.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">{listing.name}</p>
                                        <p className="text-xs text-slate-500">{listing.governorate?.name} · {listing.category?.name}</p>
                                    </div>
                                    <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{listing.viewCount} مشاهدة</div>
                                </div>
                            ))}
                            {(!stats?.recentListings || stats.recentListings.length === 0) && (
                                <div className="text-center text-slate-500 py-8 text-sm">لا توجد إدخالات حديثة</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-gradient-to-br from-indigo-500 to-primary text-white border-none">
                    <CardHeader><CardTitle className="text-white">ملخص النظام</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                <span className="text-white/80">إجمالي الإشعارات</span>
                                <span className="text-2xl font-bold">{stats?.totalNotifications || 0}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/20 pb-4">
                                <span className="text-white/80 flex items-center gap-1"><Star className="h-4 w-4" /> إدخالات مميزة</span>
                                <span className="text-2xl font-bold">{stats?.featuredListings || 0}</span>
                            </div>
                            <div className="pt-4 text-center">
                                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                    <span className="text-sm font-medium">النظام يعمل بشكل ممتاز</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
