import React from "react";

export type DropdownUserProfileProps = {
  children: React.ReactNode
  align?: "center" | "start" | "end"
}

export interface AdditionalProps {
    userEmail: string;
    userName?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  decoration?: string;
  decorationColor?: "indigo" | "emerald" | "rose" | "amber";
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface TabListProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: any) => void;
}

export interface SidebarHeaderProps {
  title: string;
  subtitle: string;
  logoColor?: string;
  className?: string;
}
