import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";
import { APP_LOGO } from "@/constants/app";

let cachedIcon: string | null = null; // null = not fetched yet
const listeners = new Set<(icon: string) => void>();

export async function refreshCompanyIcon() {
  try {
    const companyDetailsId = localStorage.getItem("companyDetailsId");
    if (!companyDetailsId) return;

    const res = await Get(
      "superadmin/company-details",
      { companyDetailsId },
      false,
    );
    if (res.data?.success) {
      cachedIcon = res.data.data?.icon || "";
      try {
        localStorage.setItem("companyLogo", res.data.data?.logo || "");
      } catch {
        // Ignore localStorage write failures when storage is unavailable.
      }
      listeners.forEach((fn) => fn(cachedIcon as string));
    }
  } catch (e) {
    console.error("Failed to load company icon:", e);
  }
}

export function useCompanyIcon() {
  const [icon, setIcon] = useState<string>(cachedIcon ?? "");

  useEffect(() => {
    listeners.add(setIcon);
    if (cachedIcon === null) refreshCompanyIcon();
    return () => {
      listeners.delete(setIcon);
    };
  }, []);

  return icon || APP_LOGO; // no icon saved -> default logo
}
