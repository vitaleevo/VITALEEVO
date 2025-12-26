import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center py-12 px-4">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white dark:bg-[#151e32] shadow-2xl rounded-3xl",
                    },
                }}
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                forceRedirectUrl="/account"
            />
        </div>
    );
}
