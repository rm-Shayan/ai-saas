import React, { useState } from "react";
import { IAiComponent, RenderAiComponent } from "./rendercomponent";

interface AiPageProps {
  component: IAiComponent | null;
  chartValues?: any;
  onClose?: () => void;
}

const AiPage: React.FC<AiPageProps> = ({ component, chartValues, onClose }) => {

   
  const [show, setShow] = useState(true);

  if (!component || !show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background overflow-auto shadow-2xl">
      <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">AI Preview</h2>
        <button
          onClick={() => {
            setShow(false);
            onClose?.();
          }}
          className="inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close preview"
        >
          ✕
        </button>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <RenderAiComponent component={component} />
      </div>
    </div>
  );
};

export default AiPage;
