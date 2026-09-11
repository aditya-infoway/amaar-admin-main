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
  purchase_order: string; // PO number, empty string if none
  po_status: PoStatus;
}

export const materialList: MaterialItem[] = [
{
  item_id: "MAT-0001",
  name: "MS Sheet 3mm",
  item_code: "MS-SHEET-003",
  item_location: "Rack A1 - Bay 2",
  category: "Raw Material",
  unit: "Kg",
  available_stock: 420,
  required_stock: 600,
  purchase_order: "PO/26-27/014",
  po_status: "raised",
},
{
  item_id: "MAT-0002",
  name: "Hydraulic Cylinder 4T",
  item_code: "HYD-CYL-004",
  item_location: "Rack B3 - Bay 1",
  category: "Hydraulic",
  unit: "Nos",
  available_stock: 12,
  required_stock: 10,
  purchase_order: "",
  po_status: "none",
},
{
  item_id: "MAT-0003",
  name: "Axle Beam 6 Ton",
  item_code: "AXL-BEAM-006",
  item_location: "Yard - Section C",
  category: "Axle",
  unit: "Nos",
  available_stock: 3,
  required_stock: 8,
  purchase_order: "PO/26-27/018",
  po_status: "pending",
},
{
  item_id: "MAT-0003",
  name: "Axle Beam 6 Ton",
  item_code: "AXL-BEAM-006",
  item_location: "Yard - Section C",
  category: "Axle",
  unit: "Nos",
  available_stock: 3,
  required_stock: 8,
  purchase_order: "PO/26-27/018",
  po_status: "pending",
},
{
  item_id: "MAT-0003",
  name: "Axle Beam 6 Ton",
  item_code: "AXL-BEAM-006",
  item_location: "Yard - Section C",
  category: "Axle",
  unit: "Nos",
  available_stock: 3,
  required_stock: 8,
  purchase_order: "PO/26-27/018",
  po_status: "pending",
},
{
  item_id: "MAT-0003",
  name: "Axle Beam 6 Ton",
  item_code: "AXL-BEAM-006",
  item_location: "Yard - Section C",
  category: "Axle",
  unit: "Nos",
  available_stock: 3,
  required_stock: 8,
  purchase_order: "PO/26-27/018",
  po_status: "pending",
},
{
  item_id: "MAT-0003",
  name: "Axle Beam 6 Ton",
  item_code: "AXL-BEAM-006",
  item_location: "Yard - Section C",
  category: "Axle",
  unit: "Nos",
  available_stock: 3,
  required_stock: 8,
  purchase_order: "PO/26-27/018",
  po_status: "pending",
},

];