import AccountShell from "@/features/account/AccountShell";
import AccountOverview from "@/features/account/AccountOverview";

export default function Page() {
    return (
        <AccountShell>
            <AccountOverview />
        </AccountShell>
    );
}
