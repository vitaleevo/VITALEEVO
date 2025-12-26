import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center py-12 px-4">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white dark:bg-[#151e32] shadow-2xl rounded-3xl",
                    },
                }}
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
                forceRedirectUrl="/account"
            />
        </div>
    );
}
