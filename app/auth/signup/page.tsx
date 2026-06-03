import AuthCard from "../(components)/Authcard";

export default function SignupPage() {
    return (
        <>
            <main className="grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
                {/* Decorative background blobs */}
                <div className="absolute inset-0 -z-10 opacity-30">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-surface-container-high rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[55%] bg-tertiary-container/20 rounded-full blur-[100px]" />
                </div>

                <AuthCard variant="signup" />
            </main>
        </>
    );
}