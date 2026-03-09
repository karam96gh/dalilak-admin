"use client";

import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MobileSidebar } from "./MobileSidebar";

export const Header = () => {
    const { admin, logout } = useAuthStore();

    return (
        <div className="flex items-center p-4 bg-white border-b shadow-sm h-16">
            <MobileSidebar />
            <div className="flex w-full justify-between items-center mr-4 md:mr-0">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                        مرحباً 👋 {admin?.name || "مدير النظام"}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date().toLocaleDateString("ar-EG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                </Button>
            </div>
        </div>
    );
};
