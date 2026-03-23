"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center p-6">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                    <h2 className="text-xl font-semibold text-gray-800">
                        حدث خطأ غير متوقع
                    </h2>
                    <p className="text-gray-500 max-w-md">
                        عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
                    </p>
                    <Button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="mt-2"
                    >
                        إعادة تحميل الصفحة
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
