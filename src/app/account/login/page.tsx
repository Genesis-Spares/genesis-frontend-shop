import { Suspense } from "react";
import LoginPage from "@/features/auth/LoginPage";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <LoginPage />
        </Suspense>
    );
}
