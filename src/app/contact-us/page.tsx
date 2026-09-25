import { Suspense } from "react";
import ContactPage from "@/features/contact/ContactPage";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ContactPage />
        </Suspense>
    );
}
