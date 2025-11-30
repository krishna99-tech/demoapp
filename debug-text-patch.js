import React from "react";
import { Text } from "react-native";

const originalCreateElement = React.createElement;

React.createElement = (component, props, ...children) => {
  if (typeof children === "string") {
    console.log("🔥 RAW STRING FOUND IN:", component?.name || component);
    console.log("🔥 BAD TEXT:", children);
  }
  return originalCreateElement(component, props, ...children);
};
