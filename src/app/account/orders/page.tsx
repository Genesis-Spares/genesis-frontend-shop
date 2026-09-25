import AccountShell from "@/features/account/AccountShell";
import OrdersPanel from "@/features/account/OrdersPanel";

export default function Page() {
    return (
        <AccountShell>
            <OrdersPanel />
        </AccountShell>
    );
}
