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
    <div className="fixed inset-0 z-[9999] bg-white overflow-auto shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">AI Preview</h2>
        <button
          onClick={() => {
            setShow(false);
            onClose?.();
          }}
          className="text-gray-700 font-bold hover:text-gray-900"
        >
          ✕
        </button>
      </div>
      {/* Pass chartValues to RenderAiComponent */}

      <RenderAiComponent component={component}  />
    </div>
  );
};

export default AiPage;
