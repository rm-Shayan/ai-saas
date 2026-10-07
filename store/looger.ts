// store/loggerMiddleware.ts
import { Middleware } from "@reduxjs/toolkit";

export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (process.env.NODE_ENV !== "development") return next(action);
  console.group(`Action: ${action.type}`);
  console.log("Action Payload:", action.payload);
  const result = next(action);
  console.groupEnd();
  return result;
};

