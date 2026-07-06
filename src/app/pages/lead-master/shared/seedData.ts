import { Category, Enquiry, Model, Quotation } from "./types";

export const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", code: "CAT001", categoryName: "Commercial Vehicles", slug: "commercial-vehicles", createdAt: "2024-01-10T00:00:00.000Z", status: "active" },
  { id: "cat-2", code: "CAT002", categoryName: "Passenger Vehicles", slug: "passenger-vehicles", createdAt: "2024-01-11T00:00:00.000Z", status: "active" },
  { id: "cat-3", code: "CAT003", categoryName: "Agricultural Equipment", slug: "agricultural-equipment", createdAt: "2024-01-12T00:00:00.000Z", status: "active" },
  { id: "cat-4", code: "CAT004", categoryName: "Spare Parts", slug: "spare-parts", createdAt: "2024-01-13T00:00:00.000Z", status: "inactive" },
  { id: "cat-5", code: "CAT005", categoryName: "Electric Vehicles", slug: "electric-vehicles", createdAt: "2024-01-14T00:00:00.000Z", status: "active" },
];

export const SEED_MODELS: Model[] = [
  { id: "mod-1", categoryId: "cat-1", modelCode: "MD001", modelName: "Pro Haul 1616", axleType: "6x2", capacity: "16 Ton", length: "32 ft", width: "8.2 ft", height: "9.5 ft", standardWeight: "8500 kg", status: "active" },
  { id: "mod-2", categoryId: "cat-1", modelCode: "MD002", modelName: "Pro Haul 1414", axleType: "4x2", capacity: "14 Ton", length: "28 ft", width: "8 ft", height: "9 ft", standardWeight: "7200 kg", status: "active" },
  { id: "mod-3", categoryId: "cat-1", modelCode: "MD003", modelName: "City Cargo 909", axleType: "4x2", capacity: "9 Ton", length: "22 ft", width: "7.5 ft", height: "8.5 ft", standardWeight: "5500 kg", status: "active" },
  { id: "mod-4", categoryId: "cat-2", modelCode: "MD004", modelName: "Urban Comfort 7S", axleType: "4x2", capacity: "7 Seater", length: "18 ft", width: "6.8 ft", height: "7.2 ft", standardWeight: "2100 kg", status: "active" },
  { id: "mod-5", categoryId: "cat-5", modelCode: "MD005", modelName: "E-Drive 1212", axleType: "6x4", capacity: "12 Ton", length: "30 ft", width: "8 ft", height: "9 ft", standardWeight: "6800 kg", status: "inactive" },
  { id: "mod-6", categoryId: "cat-3", modelCode: "MD006", modelName: "Farm King 4545", axleType: "4x4", capacity: "45 HP", length: "16 ft", width: "6.5 ft", height: "7 ft", standardWeight: "2800 kg", status: "active" },
];

export const SEED_ENQUIRIES: Enquiry[] = [
  { id: "enq-1", leadId: "LD0001", name: "Rajesh Patel", number: "9876543210", email: "rajesh.patel@example.com", address: "123, Ring Road", city: "Junagadh", model: "mod-1", remark: "Interested in tipper variant", nextFollowupDate: "2026-07-05", createdBy: "Admin", createdType: "Manual", createdAt: "2026-06-20T00:00:00.000Z" },
  { id: "enq-2", leadId: "LD0002", name: "Priya Shah", number: "9876543211", email: "priya.shah@example.com", address: "45, Station Road", city: "Rajkot", model: "mod-3", remark: "Wants quote for City Cargo", nextFollowupDate: "2026-07-08", createdBy: "Admin", createdType: "Manual", createdAt: "2026-06-21T00:00:00.000Z" },
  { id: "enq-3", leadId: "LD0003", name: "Kiran Mehta", number: "9876543212", email: "kiran.mehta@example.com", address: "78, GIDC Estate", city: "Vadodara", model: "mod-4", remark: "Follow up after site visit", nextFollowupDate: "2026-07-10", createdBy: "Admin", createdType: "Manual", createdAt: "2026-06-22T00:00:00.000Z" },
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: "qt-1",
    qNo: "QT000001",
    leadId: "LD0001",
    customerName: "Rajesh Patel",
    mobile: "9876543210",
    email: "rajesh.patel@example.com",
    address: "123, Ring Road",
    city: "Junagadh",
    model: "mod-1",
    tyre: "tyre-mrf",
    axle: "axle-tata",
    hydraulic: "hyd-hyva",
    box: "box-tipper",
    color: "color-white",
    chassis: "chassis-heavy",
    markup: "15000",
    discountType: "amount",
    discountValue: "5000",
    finalPrice: "703500",
    createdBy: "Admin",
    position: "Sales Executive",
    createdAt: "2026-06-23T00:00:00.000Z",
    remark: undefined
  },
];