// Import Dependencies
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ColorType } from "@/constants/app";

// ----------------------------------------------------------------------

export type PoStatus = "raised" | "pending" | "none";

interface PoStatusOption {
  value: PoStatus;
  label: string;
  color: ColorType;
  icon: React.ElementType;
}

export const poStatusOptions: PoStatusOption[] = [
  {
    value: "raised",
    label: "PO Raised",
    color: "info",
    icon: ClockIcon,
  },
  {
    value: "pending",
    label: "PO Pending",
    color: "warning",
    icon: ExclamationTriangleIcon,
  },
  {
    value: "none",
    label: "Not Required",
    color: "success",
    icon: CheckBadgeIcon,
  },
];

export interface MaterialItem {
  item_id: string;
  name: string;
  item_code: string;
  item_location: string;
  category: string;
  unit: string;
  available_stock: number;
  required_stock: number;
  purchaseRequired: number;
  purchase_order: string;
  po_status: PoStatus;
}

export const materialList: MaterialItem[] = [];