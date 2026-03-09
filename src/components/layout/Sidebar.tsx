"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Building2,
    LayoutDashboard,
    MapPin,
    Tags,
    Bell,
    Megaphone,
    Settings
} from "lucide-react";

const routes = [
    {
        label: "لوحة التحكم",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "الأقسام",
        icon: Tags,
        href: "/categories",
        color: "text-violet-500",
    },
    {
        label: "الإدخالات",
        icon: Building2,
        href: "/listings",
        color: "text-pink-700",
    },
    {
        label: "المحافظات",
        icon: MapPin,
        href: "/governorates",
        color: "text-orange-700",
    },
    {
        label: "الإشعارات",
        icon: Bell,
        href: "/notifications",
        color: "text-emerald-500",
    },
    {
        label: "الإعلانات",
        icon: Megaphone,
        href: "/ads",
        color: "text-blue-500",
    },
    {
        label: "الإعدادات",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0F172A] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14 px-3">
                    <div className="relative w-8 h-8 mr-4 bg-primary rounded-lg flex items-center justify-center font-bold text-xl ml-3">
                        د
                    </div>
                    <h1 className="text-2xl font-bold">دليلك</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href || pathname?.startsWith(`${route.href}/`)
                                    ? "text-white bg-white/10"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 ml-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
