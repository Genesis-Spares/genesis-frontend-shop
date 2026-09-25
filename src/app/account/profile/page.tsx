import AccountShell from "@/features/account/AccountShell";
import ProfilePanel from "@/features/account/ProfilePanel";

export default function Page() {
    return (
        <AccountShell>
            <ProfilePanel />
        </AccountShell>
    );
}
