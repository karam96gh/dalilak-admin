"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { hydrate } = useAuthStore();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        hydrate();
        // Check after hydrate completes and state updates
        const timeout = setTimeout(() => {
            const storedToken = localStorage.getItem('adminToken');
            if (!storedToken) {
                router.replace("/login");
            } else {
                setIsReady(true);
            }
        }, 100);
        return () => clearTimeout(timeout);
    }, [hydrate, router]);

    if (!isReady) {
        return null;
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pr-64 h-full">
                <Header />
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
