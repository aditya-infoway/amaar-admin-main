import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  FolderIcon,
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router";
import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Button, Card, Input, GhostSpinner } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { statusOptions } from "../../shared/constants";

interface BOMItem {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  unit: string;
  serialNo?: string;
  asslyQty?: string;
  ldDay?: string;
  psNo?: string;
  rejPct?: string;
  pkgNo?: string;
  mfgCd?: string;
  modDate?: string;
  person?: string;
  status?: string;
  dtlNo?: string;
  shapeDim?: string;
  finQtty?: string;
  shape?: string;
  length?: string;
  width?: string;
  children: BOMItem[];
}

interface AvailableItem {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  type: string;
  status: string;
  balanceQty: string;
}

// ---------------------------------------------------------------------------
// Tree helpers (recursive, unlimited depth — driven purely by item codes)
// ---------------------------------------------------------------------------

function insertItem(items: BOMItem[], parentId: string | null, newItem: BOMItem): BOMItem[] {
  if (!parentId) return [...items, newItem];
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, newItem] };
    }
    if (item.children.length > 0) {
      return { ...item, children: insertItem(item.children, parentId, newItem) };
    }
    return item;
  });
}

function removeItem(items: BOMItem[], id: string): BOMItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({ ...item, children: removeItem(item.children, id) }));
}

function findNodeByCode(items: BOMItem[], code: string): BOMItem | null {
  const target = code.trim().toLowerCase();
  if (!target) return null;
  for (const item of items) {
    if (item.itemCode.toLowerCase() === target) return item;
    const found = findNodeByCode(item.children, code);
    if (found) return found;
  }
  return null;
}

function collectIds(items: BOMItem[]): string[] {
  return items.flatMap((item) => [item.id, ...collectIds(item.children)]);
}

function countAll(items: BOMItem[]): number {
  return items.reduce((acc, item) => acc + 1 + countAll(item.children), 0);
}


const ROW_H = 36;
const TICK_Y = 18;
const INDENT = 24;

interface TreeProps {
  items: BOMItem[];
  level: number;
  highlightId: string | null;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onPick: (item: BOMItem) => void;
  onRemove: (id: string) => void;
}

function BOMTreeList({ items, level, highlightId, expanded, onToggle, onPick, onRemove }: TreeProps) {
  return (
    <ul className="relative" style={level > 0 ? { paddingLeft: INDENT } : undefined}>
      {items.map((item, index) => (
        <BOMTreeNode
          key={item.id}
          item={item}
          level={level}
          isLast={index === items.length - 1}
          highlightId={highlightId}
          expanded={expanded}
          onToggle={onToggle}
          onPick={onPick}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

function BOMTreeNode({
  item,
  level,
  isLast,
  highlightId,
  expanded,
  onToggle,
  onPick,
  onRemove,
}: Omit<TreeProps, "items"> & { item: BOMItem; isLast: boolean }) {
  const hasChildren = item.children.length > 0;
  const isOpen = !!expanded[item.id];
  const isHighlighted = highlightId === item.id;

  return (
    <li className="relative" style={{ minHeight: ROW_H }}>
      {level > 0 && (
        <>
          {/* vertical guide coming down from the parent level */}
          <span
            className="absolute bg-gray-300 dark:bg-dark-500"
            style={{
              left: -INDENT + 10,
              top: 0,
              width: 1,
              height: isLast ? TICK_Y : "100%",
            }}
          />
          {/* horizontal tick into this node */}
          <span
            className="absolute bg-gray-300 dark:bg-dark-500"
            style={{ left: -INDENT + 10, top: TICK_Y, width: INDENT - 10, height: 1 }}
          />
        </>
      )}

      <div
        onClick={() => onPick(item)}
        className={clsx(
          "group flex cursor-pointer items-center gap-2 rounded-md py-2 pl-1 pr-2 transition",
          isHighlighted
            ? "bg-primary-50 ring-1 ring-inset ring-primary-400 dark:bg-primary-900/30"
            : "hover:bg-gray-50 dark:hover:bg-dark-600"
        )}
        style={{ minHeight: ROW_H }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(item.id);
          }}
          className="flex size-5 shrink-0 items-center justify-center"
        >
          {hasChildren ? (
            <ChevronDownIcon
              className={clsx("size-4 text-gray-400 transition-transform", !isOpen && "-rotate-90")}
            />
          ) : (
            <span className="block size-1 rounded-full bg-gray-300 dark:bg-dark-500" />
          )}
        </button>

        <span className={clsx("size-5 shrink-0", hasChildren ? "text-primary-600" : "text-gray-400")}>
          {hasChildren ? <FolderIcon /> : <DocumentTextIcon />}
        </span>

        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="shrink-0 text-sm font-medium text-gray-900 dark:text-dark-50">{item.itemCode}</span>
          <span className="truncate text-xs text-gray-500 dark:text-dark-300">{item.itemName}</span>
        </div>

        <span className="shrink-0 text-xs font-semibold text-gray-600 dark:text-dark-300">Qty: {item.quantity}</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="shrink-0 text-gray-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
        >
          <XMarkIcon className="size-4" />
        </button>
      </div>

      {hasChildren && isOpen && (
        <BOMTreeList
          items={item.children}
          level={level + 1}
          highlightId={highlightId}
          expanded={expanded}
          onToggle={onToggle}
          onPick={onPick}
          onRemove={onRemove}
        />
      )}
    </li>
  );
}


export default function BOM2CreatePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Tree expand state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const [parentCode, setParentCode] = useState<string>("");
  const [childCode, setChildCode] = useState<string>("");

  const [serialNo, setSerialNo] = useState<string>("");
  const [asslyQty, setAsslyQty] = useState<string>("");
  const [ldDay, setLdDay] = useState<string>("");
  const [psNo, setPsNo] = useState<string>("");
  const [rejPct, setRejPct] = useState<string>("");
  const [pkgNo, setPkgNo] = useState<string>("");
  const [mfgCd, setMfgCd] = useState<string>("");
  const [modDate, setModDate] = useState<string>("");
  const [person, setPerson] = useState<string>("");
  const [dtlNo, setDtlNo] = useState<string>("");

  // Shape/Dimension fields
  const [shapeDim, setShapeDim] = useState<string>("");
  const [finQtty, setFinQtty] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [qty, setQty] = useState<string>("");

  // BOM header details
  const [bomName, setBomName] = useState<string>("");
  const [bomCode, setBomCode] = useState<string>("");
  const [bomStatus, setBomStatus] = useState<string>("active");

  // Load available items
  useEffect(() => {
    const mockItems: AvailableItem[] = [
      { id: "1", itemCode: "002", itemName: "Steel Plate", unit: "KG", type: "Raw Material", status: "Active", balanceQty: "100" },
      { id: "2", itemCode: "0077", itemName: "Angle Iron", unit: "MTR", type: "Raw Material", status: "Active", balanceQty: "50" },
      { id: "3", itemCode: "0035", itemName: "Bolt Set", unit: "NOS", type: "Hardware", status: "Active", balanceQty: "200" },
      { id: "4", itemCode: "00300", itemName: "Welding Rod", unit: "KG", type: "Consumable", status: "Active", balanceQty: "75" },
      { id: "5", itemCode: "0041", itemName: "Steel Sheet", unit: "SQFT", type: "Raw Material", status: "Active", balanceQty: "30" },
    ];

    const loadItems = async () => {
      setLoading(true);
      try {
        const response = await Get("master/itemmaster/list", {}, false);
        if (response.data?.success) {
          setAvailableItems(
            (response.data.data || []).map((item: any) => ({
              id: String(item.itemId),
              itemCode: item.itemCode || "",
              itemName: item.itemName || "",
              unit: item.unit || "NOS",
              type: "Raw Material",
              status: item.status || "Active",
              balanceQty: "0",
            }))
          );
        } else {
          setAvailableItems(mockItems);
        }
      } catch (error) {
        setAvailableItems(mockItems);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const totalItems = useMemo(() => countAll(bomItems), [bomItems]);
  const hasBOMItems = bomItems.length > 0;

  const filteredAvailableItems = useMemo(() => {
    if (!searchQuery.trim()) return availableItems;
    const query = searchQuery.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
  }, [availableItems, searchQuery]);

  const matchedParent = useMemo(
    () => (parentCode.trim() ? findNodeByCode(bomItems, parentCode) : null),
    [bomItems, parentCode]
  );

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const ids = collectIds(bomItems);
    setExpandedNodes(Object.fromEntries(ids.map((id) => [id, true])));
  };

  const handleCollapseAll = () => setExpandedNodes({});

  const handlePickNode = (item: BOMItem) => {
    setParentCode(item.itemCode);
    setExpandedNodes((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleRemoveNode = (id: string) => {
    setBomItems((prev) => removeItem(prev, id));
  };


  const handlePickReferenceItem = (item: AvailableItem) => {
    setChildCode(item.itemCode);
  };

  const handleCalculate = () => {
    if (length && width && qty) {
      const calculatedArea = (parseFloat(length) * parseFloat(width) * parseFloat(qty)).toFixed(2);
      setFinQtty(calculatedArea);
      toastsuccessmsg("Calculation completed successfully.");
    } else {
      toasterrormsg("Please enter Length, Width, and Quantity for calculation.");
    }
  };

  const buildItem = (code: string): BOMItem => {
    const known = availableItems.find((i) => i.itemCode.toLowerCase() === code.trim().toLowerCase());
    return {
      id: Date.now().toString(),
      itemCode: code.trim(),
      itemName: known?.itemName || code.trim(),
      quantity: qty || "1",
      unit: known?.unit || "NOS",
      serialNo,
      asslyQty,
      ldDay,
      psNo,
      rejPct,
      pkgNo,
      mfgCd,
      modDate,
      person,
      status: bomStatus,
      dtlNo,
      shapeDim,
      finQtty,
      shape,
      length,
      width,
      children: [],
    };
  };

  const resetEntryFields = () => {
    setSerialNo("");
    setAsslyQty("");
    setLdDay("");
    setPsNo("");
    setRejPct("");
    setPkgNo("");
    setMfgCd("");
    setModDate("");
    setPerson("");
    setDtlNo("");
    setShapeDim("");
    setFinQtty("");
    setShape("");
    setLength("");
    setWidth("");
    setQty("");
  };

  const handleAddToTree = () => {
    if (!hasBOMItems) {
      if (!parentCode.trim()) {
        toasterrormsg("Please enter an item code.");
        return;
      }

      const rootItem = buildItem(parentCode);
      setBomItems([rootItem]);
      resetEntryFields();
      toastsuccessmsg("Root item added to BOM structure.");
      return;
    }

    if (!childCode.trim()) {
      toasterrormsg("Please enter the Child item code.");
      return;
    }

    let parentId: string | null = null;

    if (parentCode.trim()) {
      const parentNode = findNodeByCode(bomItems, parentCode);
      if (!parentNode) {
        toasterrormsg("Parent item code not found in the BOM structure. Add it first, or leave Parent blank to add a root item.");
        return;
      }
      parentId = parentNode.id;
    }

    const newItem = buildItem(childCode);

    setBomItems((prev) => insertItem(prev, parentId, newItem));

    if (parentId) {
      setExpandedNodes((prev) => ({ ...prev, [parentId as string]: true }));
    }


    setChildCode("");
    resetEntryFields();

    toastsuccessmsg("Item added to BOM structure.");
  };

  const handleSaveBOM = async () => {
    if (!bomName) {
      toasterrormsg("Please enter BOM name.");
      return;
    }
    if (!bomCode) {
      toasterrormsg("Please enter BOM code.");
      return;
    }
    if (bomItems.length === 0) {
      toasterrormsg("Please add at least one item to BOM.");
      return;
    }

    const payload = {
      bomName,
      bomCode,
      status: bomStatus,
      items: bomItems,
    };

    try {
      const response = await Post("master/bom2/create", payload, false);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "BOM created successfully.");
        navigate("/master/bom2");
      } else {
        toasterrormsg(response.data?.message || "Failed to create BOM.");
      }
    } catch (error) {
      console.log("API call failed, using mock save:", payload);
      toastsuccessmsg("BOM created successfully (demo mode).");
      setTimeout(() => navigate("/master/bom2"), 1000);
    }
  };

  if (loading) {
    return (
      <Page title="Create BOM">
        <div className="flex h-64 w-full items-center justify-center">
          <GhostSpinner className="size-8 border-4" />
        </div>
      </Page>
    );
  }

  return (
    <Page title="Create BOM">
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="border-b-4 border-primary text-xl font-bold tracking-wide text-primary dark:text-dark-50 lg:text-2xl">
            Create BOM
          </h2>
          <Link to="/master/bom2">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        {/* BOM Details */}
        <Card className="mb-6 p-3">
          <div className="mb-4 border-b border-gray-200 pb-4 dark:border-dark-500">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">BOM Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="BOM Name" value={bomName} onChange={(e) => setBomName(e.target.value)} placeholder="Enter BOM name" />
            <Input label="BOM Code" value={bomCode} onChange={(e) => setBomCode(e.target.value)} placeholder="Enter BOM code" />
            <Listbox
              data={statusOptions}
              value={statusOptions.find((item) => item.id === bomStatus) || { id: "active", label: "Active" }}
              onChange={(item) => setBomStatus(item.id)}
              label="Status"
              placeholder="Select status"
              displayField="label"
            />
          </div>
        </Card>

        {/* Top Section: Tree View + Parent/Child form */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* Left Side - Tree View */}
          <div className="lg:col-span-7">
            <Card className="h-full p-3">
              <div className="mb-4 border-b border-gray-200 pb-4 dark:border-dark-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">BOM Structure</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                      {totalItems > 0
                        ? `${totalItems} item${totalItems > 1 ? "s" : ""} — click any item to copy its code into Parent`
                        : "Tree view of BOM items"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outlined" onClick={handleExpandAll}>
                      Expand All
                    </Button>
                    <Button variant="outlined" onClick={handleCollapseAll}>
                      Collapse All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-[500px] space-y-1 overflow-y-auto pr-1">
                {bomItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 dark:text-dark-300">
                    No items in BOM yet. Enter an Item Code in Parent and click "Add Root Item" to start.
                  </div>
                ) : (
                  <BOMTreeList
                    items={bomItems}
                    level={0}
                    highlightId={matchedParent?.id ?? null}
                    expanded={expandedNodes}
                    onToggle={toggleNode}
                    onPick={handlePickNode}
                    onRemove={handleRemoveNode}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Right Side - Parent / Child form */}
          <div className="lg:col-span-3">
            <Card className="h-full p-3">
              <div className="mb-4 border-b border-gray-200 pb-4 dark:border-dark-500">
                <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">Standard BOM</h3>
              </div>

              <div className="space-y-4">
                {/* Parent — direct input, matched against the whole tree */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">Parent</label>
                  <Input
                    value={parentCode}
                    onChange={(e) => setParentCode(e.target.value)}
                    placeholder={hasBOMItems ? "Item code of parent (blank = root item)" : "Item code of first item"}
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-dark-400">
                    {!hasBOMItems
                      ? "BOM is empty — this becomes the first (root) item."
                      : parentCode.trim() === ""
                        ? "Blank — new item will be added as a root item."
                        : matchedParent
                          ? `Found in tree: ${matchedParent.itemName}`
                          : "Not found yet in the BOM structure."}
                  </p>
                </div>

                {/* Child — only appears once at least one item exists */}
                {hasBOMItems && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">Child</label>
                    <Input
                      value={childCode}
                      onChange={(e) => setChildCode(e.target.value)}
                      placeholder="Item code to add under Parent"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">Serial#</label>
                    <Input value={serialNo} onChange={(e) => setSerialNo(e.target.value)} placeholder="Serial#" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">Assly Qty</label>
                    <Input value={asslyQty} onChange={(e) => setAsslyQty(e.target.value)} placeholder="Assly Qty" />
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-dark-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                        Length(mm)
                      </label>
                      <Input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="Length(mm)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                        Width(mm)
                      </label>
                      <Input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="Width(mm)"
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">Qtty</label>
                      <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qtty" />
                    </div>
                    <div className="flex items-end">
                      <Button color="primary" onClick={handleCalculate} className="w-full">
                        Calculate
                      </Button>
                    </div>
                  </div>
                </div>

                <Button color="success" onClick={handleAddToTree} className="mt-4 w-full">
                  {hasBOMItems ? "Add to BOM Structure" : "Add Root Item"}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Reference item list (no select column) */}
        <Card>
          <div className="mb-4 border-b border-gray-200 p-4 dark:border-dark-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">All Available Items</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">Click a row to copy its code into Child</p>
              </div>
              <div className="relative w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-dark-500 dark:bg-dark-600">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Item Code</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Item Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Balance Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Unit</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-dark-50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {filteredAvailableItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-dark-300">
                      {searchQuery ? "No items match your search" : "No items available"}
                    </td>
                  </tr>
                ) : (
                  filteredAvailableItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handlePickReferenceItem(item)}
                      className={clsx(
                        "cursor-pointer transition hover:bg-gray-50 dark:hover:bg-dark-600",
                        childCode === item.itemCode && "bg-primary-50 dark:bg-primary-900/20"
                      )}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-dark-50">{item.itemCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">{item.itemName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-dark-700 dark:text-dark-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">{item.balanceQty}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-50">{item.unit}</td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex rounded px-2 py-1 text-xs font-medium",
                            item.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-dark-700 dark:text-dark-200"
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <Link to="/master/bom2">
            <Button variant="outlined" color="secondary">
              Cancel
            </Button>
          </Link>
          <Button color="primary" onClick={handleSaveBOM}>
            Create BOM
          </Button>
        </div>
      </div>
    </Page>
  );
}