
import { ReactNode, ComponentType } from "react";

export type HomeLayoutProps = {
  pageTitle: string | ReactNode;
  children: ReactNode;
};

export type NavigationItem = {
  title: string;
  path: string;
  icon: ComponentType;
};