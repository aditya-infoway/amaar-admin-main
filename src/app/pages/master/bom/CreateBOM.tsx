// src/pages/master/bom/create/index.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { masterStorage } from "../shared/storage";
import { BOMItem, BOMComponent } from "./types";


export default function CreateBOM() {
  const navigate = useNavigate();

  // Static item master data for auto-fill
  const itemMaster = [
    { code: "MAR-SUZ-Z", name: "Brake System", category: "Brake System", group: "bs", price: "1400.00" },
    { code: "MAR-TD", name: "Trailer", category: "Trailer Detail", group: "TD", price: "300.00" },
    { code: "HYU-mcs", name: "Chassis", category: "Main Chassis", group: "MC", price: "2500.00" },
    { code: "HYU-BDS", name: "Spare Parts", category: "Body Details", group: "BD", price: "2400.00" },
    { code: "MAR-SUZ-hyd", name: "Hykit", category: "Hyd Kit", group: "HK", price: "2300.00" },
    { code: "HYU-AX", name: "Axle", category: "Axle", group: "AX", price: "1400.00" },
    { code: "HYU-jkl", name: "Suspension", category: "Suspension", group: "SN", price: "800.00" },
    { code: "HYU-CRE-zx", name: "CAT", category: "Tyre", group: "T1", price: "1900.00" },
    { code: "MAR-SUZ-asd", name: "Rims", category: "Rim", group: "RM", price: "400.00" },
  ];

  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    itemCategory: "",
    group: "",
    salesPrice: "",
  });

  // BOM fields
  const [bomData, setBomData] = useState({
    mainParent: "",
    parentCode: "",
    childCode: "",
    childSerial: "",
    qty: "",
  });

  // Store all BOM entries for hierarchical display
  const [bomEntries, setBomEntries] = useState<BOMComponent[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill function when parent code changes
  const handleParentCodeChange = (value: string) => {
    const item = itemMaster.find(i => i.code === value);
    if (item) {
      setFormData({
        itemCode: item.code,
        itemName: item.name,
        itemCategory: item.category,
        group: item.group,
        salesPrice: item.price,
      });
    } else {
      setFormData({
        itemCode: value,
        itemName: "",
        itemCategory: "",
        group: "",
        salesPrice: "",
      });
    }
    setBomData(prev => ({ ...prev, parentCode: value }));
  };

  // Auto-add to BOM when both parent and child codes are filled
  useEffect(() => {
    if (bomData.parentCode && bomData.childCode && bomData.qty) {
      // Check if this combination already exists
      const exists = bomEntries.some(
        entry => entry.parentCode === bomData.parentCode && 
                 entry.childCode === bomData.childCode
      );
      
      if (!exists) {
        const parentItem = itemMaster.find(i => i.code === bomData.parentCode);
        const childItem = itemMaster.find(i => i.code === bomData.childCode);
        
        setBomEntries([
          ...bomEntries,
          {
            id: String(Date.now()),
            parentCode: bomData.parentCode,
            parentName: parentItem?.name || "",
            childCode: bomData.childCode,
            childName: childItem?.name || "",
            childSerial: bomData.childSerial || "-",
            qty: bomData.qty || "1",
          },
        ]);
        
        // Clear child fields, keep main parent
        setBomData(prev => ({
          mainParent: prev.mainParent,
          parentCode: "",
          childCode: "",
          childSerial: "",
          qty: "",
        }));
      }
    }
  }, [bomData.parentCode, bomData.childCode, bomData.qty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "parentCode") {
      handleParentCodeChange(value);
    } else {
      setBomData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Remove entry
  const removeEntry = (id: string) => {
    setBomEntries(bomEntries.filter(entry => entry.id !== id));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCode.trim()) {
      newErrors.itemCode = "Item Code is required";
    }
    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item Name is required";
    }
    if (!formData.itemCategory.trim()) {
      newErrors.itemCategory = "Item Category is required";
    }
    if (!formData.group.trim()) {
      newErrors.group = "Group is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

 const existingItems = masterStorage.getBOMItems() || [];
    const maxId = existingItems.reduce((max, item) => {
      const numId = parseInt(item.id);
      return numId > max ? numId : max;
    }, 0);

    const newItem: BOMItem = {
      id: String(maxId + 1),
      itemCode: formData.itemCode,
      itemName: formData.itemName,
      shortName: formData.itemCode.toLowerCase().substring(0, 3),
      itemCategory: formData.itemCategory,
      group: formData.group,
      salesPrice: formData.salesPrice || "0.00",
      mrp: "0.00",
      barcode: "—",
      mainParent: bomData.mainParent || "",
      components: bomEntries.length > 0 ? bomEntries : [],
    };

   masterStorage.saveBOMItems([...existingItems, newItem]);
    navigate("/master/bom");
  };

  // Render hierarchical tree
  const renderHierarchy = () => {
    if (!bomData.mainParent && bomEntries.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          No BOM entries added yet. Enter parent-child relationships above.
        </div>
      );
    }

    // Get all child entries for a parent
    const getChildren = (parentCode: string) => {
      return bomEntries.filter(entry => entry.parentCode === parentCode);
    };

    // Find root (main parent)
    const rootEntries = bomEntries.filter(entry => entry.parentCode === bomData.mainParent);
    
    if (rootEntries.length === 0 && bomData.mainParent) {
      return (
        <div className="text-center text-gray-400 py-8">
          No components found for main parent: {bomData.mainParent}
        </div>
      );
    }

    // Recursive render function
    const renderNode = (entry: BOMComponent, level: number = 0) => {
      const children = getChildren(entry.childCode);
      const isMainParent = entry.parentCode === bomData.mainParent;

      return (
        <div key={entry.id} className="relative">
          <div 
            className={`flex items-center gap-4 py-2 px-3 border-b border-gray-100 ${
              isMainParent ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${level * 30 + 12}px` }}
          >
            <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium text-gray-800">
                {entry.childCode}
              </div>
              <div className="text-gray-600">{entry.childName}</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Qty: {entry.qty}</span>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-400 hover:text-red-600 text-xs ml-4"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          {children.map(child => renderNode(child, level + 1))}
        </div>
      );
    };

    return (
      <div className="space-y-0">
        {/* Main parent header */}
        {bomData.mainParent && (
          <div className="bg-blue-100 border-l-4 border-blue-600 py-3 px-4 rounded-t-lg">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Main Parent:</span>
              <span className="font-medium">{bomData.mainParent}</span>
              <span className="text-gray-600">
                - {itemMaster.find(i => i.code === bomData.mainParent)?.name || ''}
              </span>
            </div>
          </div>
        )}
        {/* Render all root entries */}
        <div className="border rounded-b-lg overflow-hidden">
          {rootEntries.length > 0 ? (
            rootEntries.map(entry => renderNode(entry, 0))
          ) : bomData.mainParent ? (
            <div className="text-center text-gray-400 py-8">
              No components found for main parent. Add child components above.
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <Page title="Create BOM Item">
      <div className="p-6">
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Create New Item</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            {/* Left side - Form fields (auto-filled) */}
            <div className="space-y-4">
              <Input
                label="Item Code *"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleChange}
                placeholder="Auto-filled from parent"
                error={errors.itemCode}
                required
                className="bg-gray-50"
              />

              <Input
                label="Item Name *"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="Auto-filled from parent"
                error={errors.itemName}
                required
                className="bg-gray-50"
              />

              <Input
                label="Item Category *"
                name="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
                placeholder="Auto-filled from parent"
                error={errors.itemCategory}
                required
                className="bg-gray-50"
              />

              <Input
                label="Group *"
                name="group"
                value={formData.group}
                onChange={handleChange}
                placeholder="Auto-filled from parent"
                error={errors.group}
                required
                className="bg-gray-50"
              />

              <Input
                label="Sales Price"
                name="salesPrice"
                value={formData.salesPrice}
                onChange={handleChange}
                placeholder="Auto-filled from parent"
                className="bg-gray-50"
              />
            </div>

            {/* Right side - BOM Structure */}
            <div>
              <div className="mb-4">
                <h3 className="font-medium">BOM Structure</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    label="Main Parent"
                    name="mainParent"
                    value={bomData.mainParent}
                    onChange={handleBomChange}
                    placeholder="Enter main parent code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Parent Code"
                    name="parentCode"
                    value={bomData.parentCode}
                    onChange={handleBomChange}
                    placeholder="Enter parent code"
                  />
                  <Input
                    label="Child Code"
                    name="childCode"
                    value={bomData.childCode}
                    onChange={handleBomChange}
                    placeholder="Enter child code"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Child Serial"
                    name="childSerial"
                    value={bomData.childSerial}
                    onChange={handleBomChange}
                    placeholder="Enter child serial"
                  />
                  <Input
                    label="Qty"
                    name="qty"
                    value={bomData.qty}
                    onChange={handleBomChange}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="text-sm text-gray-500 italic">
                  Parent-child relationship will be added automatically when both are entered
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t p-4">
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create
              </Button>
              <Button
                onClick={() => navigate("/master/bom")}
                variant="outlined"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Hierarchical BOM Display - Outside the table/section */}
        <div className="mt-6 rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h3 className="text-md font-semibold">BOM Hierarchy</h3>
          </div>
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg p-4 min-h-[150px]">
              {renderHierarchy()}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}