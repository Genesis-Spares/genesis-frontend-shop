import AccountShell from "@/features/account/AccountShell";
import AddressesPanel from "@/features/account/AddressesPanel";

export default function Page() {
    return (
        <AccountShell>
            <AddressesPanel />
        </AccountShell>
    );
}
