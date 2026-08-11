import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-neu-bg rounded-[32px] p-8 shadow-neu-flat flex flex-col items-center space-y-8 border-none">
        
        {/* Logo Section */}
        <div className="w-40 h-40 rounded-full shadow-neu-flat p-4 bg-neu-bg flex items-center justify-center">
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-neu-pressed">
            <Image 
              src="/clicknotifylogo.jpeg" 
              alt="Click on Notify Logo" 
              fill 
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neu-text tracking-tight">Click on Notify</h1>
          <p className="text-neu-text-light font-medium">Mega Quiz Competition</p>
        </div>

        <div className="w-full flex flex-col space-y-6 pt-4">
          <Link 
            href="/register" 
            className="w-full py-4 px-6 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-blue font-bold text-center transition-all duration-300 hover:shadow-neu-pressed active:shadow-neu-pressed-sm"
          >
            Register Now
          </Link>
          
          <Link 
            href="/login" 
            className="w-full py-4 px-6 rounded-2xl bg-neu-bg shadow-neu-flat text-neu-text font-bold text-center transition-all duration-300 hover:shadow-neu-pressed active:shadow-neu-pressed-sm"
          >
            Login to Dashboard
          </Link>
        </div>

        <div className="pt-8 text-sm text-neu-text-light font-medium">
          Powered by Click on Notify
        </div>
      </div>
    </div>
  );
}