"use client";

import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  RadarController,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineController,
   Filler, 
} from "chart.js";

/* ---------------- Chart Register ---------------- */

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  RadarController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
   Filler, 
);

/* ---------------- Types ---------------- */

export interface IAiComponent {
  name?: string;
  props?: Record<string, any>;
  children?: IAiComponent[] | string;
}

interface RenderAiProps {
  component?: IAiComponent | null;
  chartValues?: { labels: string[]; data: number[] };
}

/* ---------------- Unsafe Parents ---------------- */

const VALID_HTML_TAGS = new Set([
  "div","p","span","h1","h2","h3","h4","h5","h6",
  "ul","ol","li",
  "section","article","header","footer","main",
  "strong","em","b","i","u","small",
  "button","a","img","table","thead","tbody","tr","td",
]);


/* ---------------- Component ---------------- */

export const RenderAiComponent: React.FC<RenderAiProps> = ({
  component,
  chartValues,
}) => {
  if (!component) return null;

  const { name: rawType = "div", props = {}, children: fallbackChildren } =
    component;

  const children = props.children ?? fallbackChildren;

  const elementType =   typeof rawType === "string" ? rawType.toLowerCase() : "div";

  /* ---------------- Chart Detection ---------------- */

  const isChart =
    props.config &&
    typeof props.config === "object" &&
    typeof props.config.type === "string";

  /* ✅ Hooks ALWAYS at top level */
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isChart || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const config = structuredClone(props.config);

    if (chartValues) {
      config.data.labels = chartValues.labels;
      config.data.datasets[0].data = chartValues.data;
    }

    const chart = new ChartJS(ctx, config);
    return () => chart.destroy();
  }, [isChart, props.config, chartValues]);

  if (isChart) {
    return <canvas ref={chartRef} />;
  }

  /* ---------------- Children Renderer ---------------- */

 const renderChildren = (nodes: any): React.ReactNode => {
  if (nodes == null) return null;

  // console.log("node",typeof nodes,nodes)
  // string / number
  if (typeof nodes === "string" || typeof nodes === "number") {

    console.log(nodes)
    return <>
    {nodes}</>;
  }

  // array
  if (Array.isArray(nodes)) {
    return nodes.map((child, idx) => {
      if (child == null) return null;

      if (typeof child === "string" || typeof child === "number") {
        return <React.Fragment key={idx}>{child}</React.Fragment>;
      }

      if (typeof child === "object" && child?.name) {
        return (
          <RenderAiComponent
            key={idx}
            component={child}
            chartValues={chartValues}
          />
        );
      }

      return null; // ❗ INVALID CHILD
    });
  }

  // single valid component object
  if (typeof nodes === "object" && nodes?.name) {
    return (
      <RenderAiComponent
        component={nodes}
        chartValues={chartValues}
      />
    );
  }

  // ❗ everything else ignored
  return null;
};


  /* ---------------- Parent Safety ---------------- */

const safeType =
  VALID_HTML_TAGS.has(elementType)
    ? elementType
    : "div";


  /* ❗ VERY IMPORTANT: invalid DOM props remove karo */
  const {
    children: _ignored,
    config,
    type,
    name,
    ...restProps
  } = props;

const sanitizedClassName =
  typeof restProps.className === "string"
    ? restProps.className.replace(/text-white|opacity-\d+/g, "")
    : undefined;

    const sanitizedProps = {
  ...restProps,
  className: sanitizedClassName,
};

 return React.createElement(
  safeType,
  sanitizedProps,
  renderChildren(children)
);
};
