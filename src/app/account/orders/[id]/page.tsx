import { Suspense } from "react";
import AccountShell from "@/features/account/AccountShell";
import OrderDetail from "@/features/account/OrderDetail";

export default function Page() {
    return (
        <AccountShell>
            <Suspense fallback={null}>
                <OrderDetail />
            </Suspense>
        </AccountShell>
    );
}
