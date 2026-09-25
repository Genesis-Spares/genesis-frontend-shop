import { Suspense } from "react";
import AccountShell from "@/features/account/AccountShell";
import ReturnRequestForm from "@/features/account/ReturnRequestForm";

export default function Page() {
    return (
        <AccountShell>
            <Suspense fallback={null}>
                <ReturnRequestForm />
            </Suspense>
        </AccountShell>
    );
}
