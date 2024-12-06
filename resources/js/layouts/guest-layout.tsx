import ApplicationLogo from "@/components/application-logo";
import { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12">
                <div className="mb-8">
                    <ApplicationLogo className="w-20 h-20" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Project Manager</h1>
                <p className="text-lg text-white/80 text-center max-w-md">
                    Streamline your project management with our powerful and intuitive platform. 
                    Organize tasks, collaborate with team members, and achieve your goals efficiently.
                </p>
            </div>

            {/* Right side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}