"use client";

interface AIDirectorNotesProps {
  value?: string;
  onChange?: (val: string) => void;
}

const AIDirectorNotes = ({ value, onChange }: AIDirectorNotesProps) => {
  return (
    <div className="relative w-full h-[120px] bg-black border border-white/10 rounded-[18px] p-6 focus-within:border-[#5B45FF]/50 transition-all shadow-xl group">
      <textarea
        aria-label="AI Director Notes (Optional)"
        placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
        className="w-full h-full bg-transparent resize-none font-roboto font-normal text-sm leading-relaxed text-white placeholder:text-[#3A3F4B] focus:outline-none scrollbar-hide"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default AIDirectorNotes;
