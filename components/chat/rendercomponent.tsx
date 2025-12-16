"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { IAiComponent } from "@/store/slices/promptSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ---------------- RENDER AI COMPONENT ----------------
interface RenderAiProps {
  component?: IAiComponent;
  chartValues?: { labels: string[]; data: number[] };
}

const RenderAiComponent: React.FC<RenderAiProps> = ({ component, chartValues }) => {
  if (!component || !component.name) return null;

  const { name, props } = component;

  // Render Chart if name is "Chart"
  if (name === "Chart" && chartValues) {
    const chartData = {
      labels: chartValues.labels,
      datasets: [
        {
          label: "Values",
          data: chartValues.data,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
        },
      ],
    };
    return <Bar data={chartData} />;
  }

  // Recursive rendering for children
  const renderChildren = (children: any) => {
    if (!children) return null;
    if (Array.isArray(children)) {
      return children.map((child, index) =>
        child?.name ? (
          <RenderAiComponent key={index} component={child} chartValues={chartValues} />
        ) : (
          <React.Fragment key={index}>{child}</React.Fragment>
        )
      );
    }
    return children;
  };

  return React.createElement(name, props ?? {}, props?.children ? renderChildren(props.children) : null);
};

// ---------------- AI PAGE WITH PREVIEW TOGGLE ----------------
export default function AiPage() {
  const { aiResponse, preview } = useSelector((state: RootState) => state.prompt);

  const component = aiResponse?.component;
  const chartValues = aiResponse?.chartValues; // Only labels and data

  const [showPreview, setShowPreview] = useState(false);

  const handleTogglePreview = () => setShowPreview((prev) => !prev);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">AI Response Render</h1>

      {preview && (
        <button
          onClick={handleTogglePreview}
          className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      )}

      {showPreview && component ? (
        <RenderAiComponent component={component} chartValues={chartValues} />
      ) : showPreview && !component ? (
        <p className="text-gray-500">No AI component to render yet.</p>
      ) : null}
    </div>
  );
}
