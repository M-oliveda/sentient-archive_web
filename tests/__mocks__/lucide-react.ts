import React from "react";

const svg = (props: React.SVGProps<SVGSVGElement>) => React.createElement("svg", props);

// Existing icons
export const Mail = svg;
export const User = svg;
export const Eye = svg;
export const EyeOff = svg;
export const Lock = svg;
export const Check = svg;
export const X = svg;
export const CircleCheck = svg;
export const CircleAlert = svg;
export const Loader2Icon = (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement("svg", { ...props, role: "status", "aria-label": "Loading" });
export const Scale = svg;
export const ArrowUp = svg;
export const CheckCircle2 = svg;
export const CheckIcon = svg;

// Dashboard layout icons
export const LayoutDashboard = svg;
export const FileText = svg;
export const Bot = svg;
export const History = svg;
export const Settings = svg;
export const Users = svg;
export const Coins = svg;
export const Power = svg;
export const Clock = svg;

// Dashboard home icons
export const FilePlus = svg;
export const Upload = svg;
export const ArrowRight = svg;
export const Folder = svg;

// Landing page icons
export const CoinsIcon = svg;
export const Brain = svg;
export const Link2 = svg;
export const Shield = svg;
export const Search = svg;
export const Activity = svg;
export const PenLine = svg;
export const FolderTree = svg;
export const BookOpen = svg;
export const Tag = svg;
export const MessageCircle = svg;
export const UserPlus = svg;
export const Sparkles = svg;

// PublicNavbar icons
export const Menu = svg;
export const ChevronRight = svg;
