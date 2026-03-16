import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ExpandableRowProps {
  cells: ReactNode[];
  expandedContent: ReactNode;
  gridCols: string;
}

export default function ExpandableRow({ cells, expandedContent, gridCols }: ExpandableRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-white/5">
      <div
        className="grid items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors duration-200"
        style={{ gridTemplateColumns: gridCols }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            size={16}
            className={`text-secondary transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
          />
          {cells[0]}
        </div>
        {cells.slice(1).map((cell, i) => (
          <div key={i}>{cell}</div>
        ))}
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pl-10">{expandedContent}</div>
      </div>
    </div>
  );
}
