export const APP_NAME = "Autobook ERP";
export const APP_KEY = "tailux";
export const APP_LOGO = "/images/ammar/fav.png";
export const APP_FAVICON = "/images/ammar/fav.png";

// Redirect Paths
export const REDIRECT_URL_KEY = "redirect";
export const HOME_PATH = "/";
export const GHOST_ENTRY_PATH = "/login";
export const SELECT_COMPANY_PATH = "/select-company";

// Navigation Types
export type NavigationType = "root" | "group" | "collapse" | "item" | "divider";

export const COLORS = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
] as const;

export type ColorType = (typeof COLORS)[number];
