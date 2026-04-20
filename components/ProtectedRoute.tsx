"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./layouts/Loader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem("access_token");

        if (!token) {
            router.replace("/auth/login");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) return <Loader />;

    return <>{children}</>;
}