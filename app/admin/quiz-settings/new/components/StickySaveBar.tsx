import { Save } from "lucide-react";

interface Props {
  questionCount: number;
  isSaving: boolean;
  onSave: (isPublished: boolean) => void;
}

export default function StickySaveBar({ questionCount, isSaving, onSave }: Props) {
  return (
    <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-transparent p-4 z-20 pointer-events-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between bg-neu-bg/90 backdrop-blur-md p-4 rounded-[32px] shadow-neu-flat border border-white/20 pointer-events-auto">
        <p className="text-sm font-bold text-neu-text-light hidden sm:block ml-4">
          {questionCount} Question{questionCount !== 1 ? 's' : ''} ready
        </p>
        <div className="flex gap-4 w-full sm:w-auto">
           <button
            onClick={() => onSave(false)}
            disabled={isSaving}
            className="flex-1 sm:flex-none rounded-2xl bg-neu-bg shadow-neu-flat px-6 py-3 text-sm font-bold text-neu-text hover:text-neu-blue active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-neu-flat"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSave(true)}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-neu-bg shadow-neu-flat px-8 py-3 text-sm font-bold text-neu-blue hover:shadow-neu-pressed-sm active:shadow-neu-pressed transition-all disabled:opacity-50 disabled:shadow-neu-flat"
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Publish Quiz</>}
          </button>
        </div>
      </div>
    </div>
  );
}
