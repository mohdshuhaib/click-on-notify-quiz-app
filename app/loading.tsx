import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neu-bg">
      <div className="flex flex-col items-center justify-center p-12 rounded-[32px] bg-neu-bg shadow-neu-flat border border-white/20">
        <div className="w-20 h-20 rounded-full bg-neu-bg shadow-neu-pressed-sm flex items-center justify-center mb-6 text-neu-blue">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-neu-text mb-2 tracking-tight">Loading</h2>
        <p className="text-neu-text-light font-medium text-center max-w-[250px]">
          Please wait while we prepare your content...
        </p>
      </div>
    </div>
  );
}
