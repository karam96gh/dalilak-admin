"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/lib/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    username: z.string().min(1, "اسم المستخدم مطلوب"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            const data = await api.post("/admin/auth/login", values) as any;
            setAuth(data.token, data.admin);
            toast({
                title: "تم تسجيل الدخول",
                description: "أهلاً بك في لوحة التحكم",
            });
            router.push("/");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error || "حدث خطأ أثناء تسجيل الدخول",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md shadow-2xl border-none relative z-10 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-3 pb-6 text-center">
                <div className="mx-auto bg-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mb-2 shadow-lg">
                    د
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">دليلك - لوحة التحكم</CardTitle>
                <CardDescription className="text-slate-500">
                    الرجاء إدخال بيانات الاعتماد للوصول
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>اسم المستخدم</FormLabel>
                                    <FormControl>
                                        <Input placeholder="admin" {...field} className="h-12 bg-slate-50" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>كلمة المرور</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} className="h-12 bg-slate-50" disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
