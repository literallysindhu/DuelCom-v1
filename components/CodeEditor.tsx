import React, { useState, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, disabled }) => {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(value.split('\n').length);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Need to defer setting selection range to after render
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-row overflow-hidden bg-[#0d0d0d] rounded-lg border border-dark-border group focus-within:border-brand-500/50 transition-colors">
      {/* Line Numbers */}
      <div className="w-12 py-4 px-2 text-right font-mono text-sm text-zinc-600 bg-dark-surface border-r border-dark-border select-none">
        {Array.from({ length: Math.max(lineCount, 15) }).map((_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 w-full h-full bg-transparent text-zinc-300 font-mono text-sm p-4 leading-6 resize-none focus:outline-none"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder="// Write your solution here..."
      />
    </div>
  );
};
