// store/loggerMiddleware.ts
import { Middleware } from "@reduxjs/toolkit";

export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  console.group(`Action: ${action.type}`);
  console.log("Previous State:", store.getState());
  console.log("Action Payload:", action.payload);
  const result = next(action);
  console.log("Next State:", store.getState());
  console.groupEnd();
  return result;
};

