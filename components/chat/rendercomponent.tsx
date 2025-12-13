import { IAiComponent } from "@/store/slices/promptSlice";
import React from "react";

interface RenderAiProps {
  component: IAiComponent;
}

export const RenderAiComponent: React.FC<RenderAiProps> = ({ component }) => {
  const { name, props } = component;

  if (!name) return null;

  const renderChildren = (children: any) => {
    if (Array.isArray(children)) {
      return children.map((child, index) =>
        child?.name ? (
          <RenderAiComponent key={index} component={child} />
        ) : (
          <React.Fragment key={index}>{child}</React.Fragment>
        )
      );
    }
    return children;
  };

  return React.createElement(
    name,
    props,
    props?.children ? renderChildren(props.children) : null
  );
};
