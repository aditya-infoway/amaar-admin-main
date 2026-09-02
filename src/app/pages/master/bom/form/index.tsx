import { useState, useMemo, useEffect, useRef  } from "react";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  FolderIcon,
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useParams } from "react-router";
import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Button, Card, Input, GhostSpinner } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { statusOptions } from "../../shared/constants";
import { useUnsavedChanges } from "@/app/contexts/unsavedChanges/context";

interface BOMItem {
  id: string;
  refItemId: string;
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
  thickness?: string;
  length?: string;
  width?: string;
  weight?: string;
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

  thickness: string;
  length: string;
  width: string;
  weight: string;
}

// ---------------------------------------------------------------------------
// Tree helpers (unchanged)
// ---------------------------------------------------------------------------

function insertItem(
  items: BOMItem[],
  parentId: string | null,
  newItem: BOMItem,
): BOMItem[] {
  if (!parentId) return [...items, newItem];
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, newItem] };
    }
    if (item.children.length > 0) {
      return {
        ...item,
        children: insertItem(item.children, parentId, newItem),
      };
    }
    return item;
  });
}

function updateItem(
  items: BOMItem[],
  id: string,
  updatedFields: Partial<BOMItem>,
): BOMItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...updatedFields,
      };
    }

    if (item.children.length > 0) {
      return {
        ...item,
        children: updateItem(item.children, id, updatedFields),
      };
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

function BOMTreeList({
  items,
  level,
  highlightId,
  expanded,
  onToggle,
  onPick,
  onRemove,
}: TreeProps) {
  return (
    <ul
      className="relative"
      style={level > 0 ? { paddingLeft: INDENT } : undefined}
    >
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
          <span
            className="dark:bg-dark-500 absolute bg-gray-300"
            style={{
              left: -INDENT + 10,
              top: 0,
              width: 1,
              height: isLast ? TICK_Y : "100%",
            }}
          />
          <span
            className="dark:bg-dark-500 absolute bg-gray-300"
            style={{
              left: -INDENT + 10,
              top: TICK_Y,
              width: INDENT - 10,
              height: 1,
            }}
          />
        </>
      )}

      <div
        onClick={() => onPick(item)}
        className={clsx(
          "group flex cursor-pointer items-center gap-2 rounded-md py-2 pr-2 pl-1 transition",
          isHighlighted
            ? "bg-primary-50 ring-primary-400 dark:bg-primary-900/30 ring-1 ring-inset"
            : "dark:hover:bg-dark-600 hover:bg-gray-50",
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
              className={clsx(
                "size-4 text-gray-400 transition-transform",
                !isOpen && "-rotate-90",
              )}
            />
          ) : (
            <span className="dark:bg-dark-500 block size-1 rounded-full bg-gray-300" />
          )}
        </button>

        <span
          className={clsx(
            "size-5 shrink-0",
            hasChildren ? "text-primary-600" : "text-gray-400",
          )}
        >
          {hasChildren ? <FolderIcon /> : <DocumentTextIcon />}
        </span>

        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="dark:text-dark-50 shrink-0 text-sm font-medium text-gray-900">
            {item.itemCode}
          </span>
          <span className="dark:text-dark-300 truncate text-xs text-gray-500">
            {item.itemName}
          </span>
        </div>

        <span className="dark:text-dark-300 shrink-0 text-xs font-semibold text-gray-600">
          Qty: {item.asslyQty}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
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

export default function BOMFormPage() {
  const navigate = useNavigate();

    const { setDirty, requestNavigation } = useUnsavedChanges();

    const handleProtectedNavigation = (path: string) => {
  requestNavigation(() => {
    navigate(path);
  });
};

  // 👇 NEW: id param se edit mode detect hota hai
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

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

  const [shapeDim, setShapeDim] = useState<string>("");
  const [finQtty, setFinQtty] = useState<string>("");
  const [shape, setShape] = useState<string>("");
  const [thickness, setThickness] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const [qty, setQty] = useState<string>("");

  const [bomName, setBomName] = useState<string>("");
  const [bomCode, setBomCode] = useState<string>("");
  const [bomStatus, setBomStatus] = useState<string>("active");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const isLoadingFieldsRef = useRef(false);

  const [isBOMDirty, setIsBOMDirty] = useState(false);

  useEffect(() => {
  setDirty(isBOMDirty);

  return () => {
    setDirty(false);
  };
}, [isBOMDirty, setDirty]);


  // ---------------------------------------------------------------------
  // 👇 NEW: ek hi useEffect me — available items load karo, AUR agar edit
  // mode hai to existing BOM bhi fetch karke saare fields + tree populate
  // karo. Dono parallel chalte hain (Promise.all).
  // ---------------------------------------------------------------------
  useEffect(() => {
    const mockItems: AvailableItem[] = [
      {
        id: "1",
        itemCode: "002",
        itemName: "Steel Plate",
        unit: "KG",
        type: "Raw Material",
        status: "Active",
        balanceQty: "100",
        thickness: "5",
        length: "1000",
        width: "500",
        weight: "19.625",
      },
      {
        id: "2",
        itemCode: "0077",
        itemName: "Angle Iron",
        unit: "MTR",
        type: "Raw Material",
        status: "Active",
        balanceQty: "50",
        thickness: "6",
        length: "1000",
        width: "50",
        weight: "2.355",
      },
    ];

    const loadAvailableItems = async () => {
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

              thickness: item.thickness != null ? String(item.thickness) : "",
              length: item.length != null ? String(item.length) : "",
              width: item.width != null ? String(item.width) : "",
              weight: item.weight != null ? String(item.weight) : "",
            })),
          );
        } else {
          setAvailableItems(mockItems);
        }
      } catch (error) {
        setAvailableItems(mockItems);
      }
    };

    const loadExistingBom = async () => {
      if (!id) return;
      isLoadingFieldsRef.current = true;
      try {
        const response = await Get(`master/bom/${id}`, {}, false);
        if (response.data?.success) {
          const data = response.data.data;
          setBomName(data.bomName || "");
          setBomCode(data.bomCode || "");
          setBomStatus(data.status || "active");
          setBomItems(data.items || []); // backend tree shape BOMItem se match karta hai
          setExpandedNodes(
            Object.fromEntries(
              collectIds(data.items || []).map((nid: string) => [nid, true]),
            ),
          );
        } else {
          toasterrormsg(response.data?.message || "Failed to fetch BOM.");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while fetching BOM.");
      }
        finally {
       requestAnimationFrame(() => {
         isLoadingFieldsRef.current = false;
       });
      }
    };

    const load = async () => {
      setLoading(true);
      await Promise.all([loadAvailableItems(), loadExistingBom()]);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totalItems = useMemo(() => countAll(bomItems), [bomItems]);
  const hasBOMItems = bomItems.length > 0;

  const filteredAvailableItems = useMemo(() => {
    if (!searchQuery.trim()) return availableItems;
    const query = searchQuery.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(query) ||
        item.itemName.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query),
    );
  }, [availableItems, searchQuery]);

  // 👇 NEW: Pagination calculations
  const totalItemsCount = filteredAvailableItems.length;
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItemsCount);
  const currentItems = filteredAvailableItems.slice(startIndex, endIndex);

  const handleUpdateItem = () => {
    if (!editingItemId) {
      toasterrormsg("Please select an item from the BOM structure.");
      return;
    }

    if (!qty) {
      toasterrormsg("Please enter Qty.");
      return;
    }

    const updatedFields: Partial<BOMItem> = {
      quantity: qty,
      serialNo,
      asslyQty,
      ldDay,
      psNo,
      rejPct,
      pkgNo,
      mfgCd,
      modDate,
      person,
      dtlNo,

      shapeDim,
      finQtty,
      shape,

      thickness,
      length,
      width,
      weight,
    };

   setBomItems((prev) => updateItem(prev, editingItemId, updatedFields));
setIsBOMDirty(true);

    toastsuccessmsg("BOM item updated successfully.");

    // Exit edit mode
    setEditingItemId(null);

    // Clear form
    setParentCode("");
    setChildCode("");
    resetEntryFields();
  };

  // 👇 NEW: Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 👇 NEW: Helper to generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const matchedParent = useMemo(
    () => (parentCode.trim() ? findNodeByCode(bomItems, parentCode) : null),
    [bomItems, parentCode],
  );

  const findAvailableByCode = (code: string): AvailableItem | undefined =>
    availableItems.find(
      (i) => i.itemCode.toLowerCase() === code.trim().toLowerCase(),
    );

  const parentMasterMatch = useMemo(
    () => (parentCode.trim() ? findAvailableByCode(parentCode) : undefined),
    [availableItems, parentCode],
  );

  const childMasterMatch = useMemo(
    () => (childCode.trim() ? findAvailableByCode(childCode) : undefined),
    [availableItems, childCode],
  );

  const toggleNode = (nid: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nid]: !prev[nid] }));
  };

  const handleExpandAll = () => {
    const ids = collectIds(bomItems);
    setExpandedNodes(Object.fromEntries(ids.map((nid) => [nid, true])));
  };

  const handleCollapseAll = () => setExpandedNodes({});

  const handlePickNode = (item: BOMItem) => {

     isLoadingFieldsRef.current = true;
    // Enter edit mode
    setEditingItemId(item.id);

    // Show selected item code
    setParentCode(item.itemCode);

    // Load all existing values into the form
    setChildCode("");

    setSerialNo(item.serialNo || "");
    setAsslyQty(item.asslyQty || "");
    setLdDay(item.ldDay || "");
    setPsNo(item.psNo || "");
    setRejPct(item.rejPct || "");
    setPkgNo(item.pkgNo || "");
    setMfgCd(item.mfgCd || "");
    setModDate(item.modDate || "");
    setPerson(item.person || "");
    setDtlNo(item.dtlNo || "");

    setShapeDim(item.shapeDim || "");
    setFinQtty(item.finQtty || "");
    setShape(item.shape || "");

    setThickness(item.thickness || "");
    setLength(item.length || "");
    setWidth(item.width || "");
    setWeight(item.weight || "");

    setQty(item.quantity || "");

    // Open selected node
    setExpandedNodes((prev) => ({
      ...prev,
      [item.id]: true,
    }));
  };

  requestAnimationFrame(() => {
     isLoadingFieldsRef.current = false;
   });


    const markBOMDirty = () => {
    setIsBOMDirty(true);
  };

 // Single source of truth: any change to the entry-panel fields marks
 // the form dirty, UNLESS we're programmatically loading values
 // (handlePickNode / loadExistingBom set the ref to skip this).
 useEffect(() => {
   if (isLoadingFieldsRef.current) return;
   markBOMDirty();
 }, [
   parentCode,
   childCode,
   serialNo,
   asslyQty,
   ldDay,
   psNo,
   rejPct,
   pkgNo,
   mfgCd,
   modDate,
   person,
   dtlNo,
   shapeDim,
   finQtty,
   shape,
   thickness,
   length,
   width,
   weight,
   qty,
 ]);

const handleRemoveNode = (nid: string) => {
  setBomItems((prev) => removeItem(prev, nid));
  setIsBOMDirty(true);
};

  const handlePickReferenceItem = (item: AvailableItem) => {
    setChildCode(item.itemCode);

    fillItemDimensions(item);
  };

  const handleCalculate = () => {
    if (length && width && qty) {
      const calculatedArea = (
        parseFloat(length) *
        parseFloat(width) *
        parseFloat(qty)
      ).toFixed(2);
      setFinQtty(calculatedArea);
      toastsuccessmsg("Calculation completed successfully.");
    } else {
      toasterrormsg(
        "Please enter Length, Width, and Quantity for calculation.",
      );
    }
  };

  const fillItemDimensions = (item: AvailableItem, asslyQtyValue?: string) => {
    const assly = parseFloat(asslyQtyValue || asslyQty || "1");

    const safeAsslyQty = !isNaN(assly) && assly > 0 ? assly : 1;

    setThickness(item.thickness || "");
    setLength(item.length || "");
    setWidth(item.width || "");

    const baseWeight = parseFloat(item.weight || "");

    if (!isNaN(baseWeight)) {
      setWeight((baseWeight * safeAsslyQty).toFixed(3));
    } else {
      setWeight("");
    }
  };

  const buildItem = (code: string): BOMItem | null => {
    const known = findAvailableByCode(code);
    if (!known) return null;

    return {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      refItemId: known.id,
      itemCode: known.itemCode,
      itemName: known.itemName,
      quantity: qty || "1",
      unit: known.unit || "NOS",

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

      thickness,
      length,
      width,
      weight,

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

    setThickness("");
    setLength("");
    setWidth("");
    setWeight("");

    setQty("");
  };

  const handleAddToTree = () => {
    if (!hasBOMItems) {
      if (!parentCode.trim()) {
        toasterrormsg("Please enter an item code.");
        return;
      }

      const rootItem = buildItem(parentCode);
      if (!rootItem) {
        toasterrormsg(
          `Item code "${parentCode}" not found in Item Master. Please enter a valid, existing item code.`,
        );
        return;
      }

      setBomItems([rootItem]);
      setIsBOMDirty(true);
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
        toasterrormsg(
          "Parent item code not found in the BOM structure. Add it first, or leave Parent blank to add a root item.",
        );
        return;
      }
      parentId = parentNode.id;
    }

    const newItem = buildItem(childCode);
    if (!newItem) {
      toasterrormsg(
        `Item code "${childCode}" not found in Item Master. Please enter a valid, existing item code.`,
      );
      return;
    }

  setBomItems((prev) => insertItem(prev, parentId, newItem));
setIsBOMDirty(true);

    if (parentId) {
      setExpandedNodes((prev) => ({ ...prev, [parentId as string]: true }));
    }

    setChildCode("");
    resetEntryFields();

    toastsuccessmsg("Item added to BOM structure.");
  };

  // ---------------------------------------------------------------------
  // 👇 NEW: Save function ab dono mode handle karta hai — edit mode me
  // Put("master/bom/update") + bomId body me jaata hai, create mode me
  // pehle jaisa hi Post("master/bom/create") chalta hai.
  // ---------------------------------------------------------------------
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

  if (isEditMode) {
    const payload = {
      bomId: Number(id),
      bomName,
      bomCode,
      status: bomStatus,
      items: bomItems,
    };

    try {
      const response = await Put(
        "master/bom/update",
        payload,
        false,
      );

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "BOM updated successfully.",
        );

        // IMPORTANT: BOM is now saved
        setDirty(false);
        setIsBOMDirty(false);

        navigate("/master/bom");
      } else {
        toasterrormsg(
          response.data?.message || "Failed to update BOM.",
        );
      }
    } catch (error) {
      toasterrormsg(
        "Something went wrong while updating BOM.",
      );
    }

    return;
  }

  const payload = {
    bomName,
    bomCode,
    status: bomStatus,
    items: bomItems,
  };

  try {
    const response = await Post(
      "master/bom/create",
      payload,
      false,
    );

    if (response.data?.success) {
      toastsuccessmsg(
        response.data?.message || "BOM created successfully.",
      );

      // IMPORTANT: BOM is now saved
      setDirty(false);
      setIsBOMDirty(false);

      navigate("/master/bom");
    } else {
      toasterrormsg(
        response.data?.message || "Failed to create BOM.",
      );
    }
  } catch (error) {
    toasterrormsg(
      "Something went wrong while creating BOM.",
    );
  }
};

  if (loading) {
    return (
      <Page title={isEditMode ? "Edit BOM" : "Create BOM"}>
        <div className="flex h-64 w-full items-center justify-center">
          <GhostSpinner className="size-8 border-4" />
        </div>
      </Page>
    );
  }

  return (
    <Page title={isEditMode ? "Edit BOM" : "Create BOM"}>
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="border-primary text-primary dark:text-dark-50 border-b-4 text-xl font-bold tracking-wide lg:text-2xl">
            {isEditMode ? "Edit BOM" : "Create BOM"}
          </h2>
       <Button
  color="primary"
  variant="outlined"
  onClick={() => handleProtectedNavigation("/master/bom")}
>
  <ChevronLeftIcon className="size-6" />
  <span>Back</span>
</Button>
        </div>

        <Card className="mb-6 p-3">
          <div className="dark:border-dark-500 mb-4 border-b border-gray-200 pb-4">
            <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
              BOM Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
  label="BOM Name"
  value={bomName}
  onChange={(e) => {
    setBomName(e.target.value);
    setIsBOMDirty(true);
  }}
  placeholder="Enter BOM name"
/>
          <Input
  label="BOM Code"
  value={bomCode}
  onChange={(e) => {
    setBomCode(e.target.value);
    setIsBOMDirty(true);
  }}
  placeholder="Enter BOM code"
/>
          <Listbox
  data={statusOptions}
  value={
    statusOptions.find((item) => item.id === bomStatus) || {
      id: "active",
      label: "Active",
    }
  }
  onChange={(item) => {
    setBomStatus(item.id);
    setIsBOMDirty(true);
  }}
  label="Status"
  placeholder="Select status"
  displayField="label"
/>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="lg:col-span-7">
            <Card className="h-full p-3">
              <div className="dark:border-dark-500 mb-4 border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                      BOM Structure
                    </h3>
                    <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
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
                  <div className="dark:text-dark-300 py-8 text-center text-gray-500">
                    No items in BOM yet. Enter an Item Code in Parent and click
                    "Add Root Item" to start.
                  </div>
                ) : (
                  <BOMTreeList
                    items={bomItems}
                    level={0}
                    highlightId={editingItemId ?? matchedParent?.id ?? null}
                    expanded={expandedNodes}
                    onToggle={toggleNode}
                    onPick={handlePickNode}
                    onRemove={handleRemoveNode}
                  />
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full p-3">
              <div className="dark:border-dark-500 mb-4 border-b border-gray-200 pb-4">
                <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                  Standard BOM
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                    Parent
                  </label>
                  <Input
                    value={parentCode}
                    onChange={(e) => setParentCode(e.target.value)}
                    placeholder={
                      hasBOMItems
                        ? "Item code of parent (blank = root item)"
                        : "Item code of first item"
                    }
                  />

                  <p className="dark:text-dark-400 mt-1 text-xs text-gray-400">
                    {!hasBOMItems
                      ? "BOM is empty — this becomes the first (root) item."
                      : parentCode.trim() === ""
                        ? "Blank — new item will be added as a root item."
                        : matchedParent
                          ? `Found in tree: ${matchedParent.itemName}`
                          : "Not found yet in the BOM structure."}
                  </p>

                  {parentCode.trim() !== "" && (
                    <p
                      className={clsx(
                        "mt-1 flex items-center gap-1 text-xs font-medium",
                        parentMasterMatch
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400",
                      )}
                    >
                      {parentMasterMatch ? (
                        <>
                          <CheckCircleIcon className="size-3.5" />
                          In Item Master: {parentMasterMatch.itemName} (
                          {parentMasterMatch.unit})
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="size-3.5" />
                          Not found in Item Master — cannot be added
                        </>
                      )}
                    </p>
                  )}
                </div>

                {hasBOMItems && (
                  <div>
                    <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                      Child
                    </label>
                    <Input
                      value={childCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setChildCode(code);

                        const item = findAvailableByCode(code);

                        if (item) {
                          fillItemDimensions(item);
                        } else {
                          setThickness("");
                          setLength("");
                          setWidth("");
                          setWeight("");
                        }
                      }}
                      placeholder="Item code to add under Parent"
                    />
                    {childCode.trim() !== "" && (
                      <p
                        className={clsx(
                          "mt-1 flex items-center gap-1 text-xs font-medium",
                          childMasterMatch
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400",
                        )}
                      >
                        {childMasterMatch ? (
                          <>
                            <CheckCircleIcon className="size-3.5" />
                            In Item Master: {childMasterMatch.itemName} (
                            {childMasterMatch.unit})
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="size-3.5" />
                            Not found in Item Master — cannot be added
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                      Serial#
                    </label>
                    <Input
                      value={serialNo}
                      onChange={(e) => setSerialNo(e.target.value)}
                      placeholder="Serial#"
                    />
                  </div>
                  <div>
                    <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                      Assly Qty
                    </label>
                    <Input
                      type="number"
                      value={asslyQty}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAsslyQty(value);

                        const selectedItem = editingItemId
                          ? findAvailableByCode(parentCode)
                          : childCode
                            ? findAvailableByCode(childCode)
                            : !hasBOMItems && parentCode
                              ? findAvailableByCode(parentCode)
                              : undefined;

                        if (selectedItem) {
                          const baseWeight = parseFloat(
                            selectedItem.weight || "",
                          );
                          const assly = parseFloat(value || "");

                          if (!isNaN(baseWeight) && !isNaN(assly)) {
                            setWeight((baseWeight * assly).toFixed(3));
                          } else {
                            setWeight("");
                          }
                        }
                      }}
                      placeholder="Assly Qty"
                    />
                  </div>
                </div>

                <div className="dark:border-dark-500 mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Thickness */}
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Thickness (mm)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={thickness}
                        onChange={(e) => setThickness(e.target.value)}
                        placeholder="Thickness(mm)"
                      />
                    </div>

                    {/* Length */}
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Length (mm)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="Length(mm)"
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Width (mm)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        placeholder="Width(mm)"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Weight (kg)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={weight}
                        readOnly
                        placeholder="Auto calculated"
                        className="dark:bg-dark-700/50 cursor-not-allowed bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Existing Qty */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Qty
                      </label>
                      <Input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                </div>

                {editingItemId ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      color="primary"
                      onClick={handleUpdateItem}
                      className="w-full"
                    >
                      Update Item
                    </Button>

                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setEditingItemId(null);
                        setParentCode("");
                        setChildCode("");
                        resetEntryFields();
                      }}
                      className="w-full"
                    >
                      Cancel Edit
                    </Button>
                  </div>
                ) : (
                  <Button
                    color="success"
                    onClick={handleAddToTree}
                    className="mt-4 w-full"
                    disabled={
                      hasBOMItems ? !childMasterMatch : !parentMasterMatch
                    }
                  >
                    {hasBOMItems ? "Add to BOM Structure" : "Add Root Item"}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>

        {isEditMode && (
          <div className="my-6 flex justify-end gap-3">
         <Button
  variant="outlined"
  color="secondary"
  onClick={() => handleProtectedNavigation("/master/bom")}
>
  Cancel
</Button>

            <Button color="primary" onClick={handleSaveBOM}>
              Update BOM
            </Button>
          </div>
        )}

        <Card>
          <div className="dark:border-dark-500 mb-4 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                  All Available Items
                </h3>
                <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
                  Click a row to copy its code into Child
                  {totalItemsCount > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({totalItemsCount} item{totalItemsCount > 1 ? "s" : ""})
                    </span>
                  )}
                </p>
              </div>
              <div className="relative w-64">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
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
                <tr className="dark:border-dark-500 dark:bg-dark-600 border-b border-gray-200 bg-gray-50">
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Item Code
                  </th>
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Item Name
                  </th>
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Type
                  </th>
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Balance Qty
                  </th>
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Unit
                  </th>
                  <th className="dark:text-dark-50 px-4 py-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="dark:divide-dark-500 divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="dark:text-dark-300 py-8 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No items match your search"
                        : "No items available"}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handlePickReferenceItem(item)}
                      className={clsx(
                        "dark:hover:bg-dark-600 cursor-pointer transition hover:bg-gray-50",
                        childCode === item.itemCode &&
                          "bg-primary-50 dark:bg-primary-900/20",
                      )}
                    >
                      <td className="dark:text-dark-50 px-4 py-3 text-sm font-medium text-gray-900">
                        {item.itemCode}
                      </td>
                      <td className="dark:text-dark-50 px-4 py-3 text-sm text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="dark:bg-dark-700 dark:text-dark-200 inline-flex rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          {item.type}
                        </span>
                      </td>
                      <td className="dark:text-dark-50 px-4 py-3 text-sm text-gray-900">
                        {item.balanceQty}
                      </td>
                      <td className="dark:text-dark-50 px-4 py-3 text-sm text-gray-900">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex rounded px-2 py-1 text-xs font-medium",
                            item.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "dark:bg-dark-700 dark:text-dark-200 bg-gray-100 text-gray-800",
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

          {/* 👇 NEW: Pagination Controls with Theme Styling */}
          {/* Pagination — theme-matched style (Show entries / page pills / count) */}
          {totalItemsCount > 0 && (
            <div className="dark:border-dark-500 flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 sm:flex-row">
              {/* Left - Show entries */}
              <div className="dark:text-dark-300 flex items-center gap-2 text-sm text-gray-700">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-700 dark:text-dark-200 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:ring-1 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              {/* Center - Page controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={clsx(
                    "flex size-8 items-center justify-center rounded-md transition",
                    currentPage === 1
                      ? "dark:text-dark-500 cursor-not-allowed text-gray-300"
                      : "dark:text-dark-300 dark:hover:bg-dark-600 text-gray-500 hover:bg-gray-100",
                  )}
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() =>
                      typeof page === "number" && setCurrentPage(page)
                    }
                    disabled={page === "..."}
                    className={clsx(
                      "flex size-8 items-center justify-center rounded-md text-sm font-medium transition",
                      page === currentPage
                        ? "bg-primary-600 dark:bg-primary-500 text-white"
                        : page === "..."
                          ? "dark:text-dark-500 cursor-default text-gray-400"
                          : "dark:text-dark-300 dark:hover:bg-dark-600 text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={clsx(
                    "flex size-8 items-center justify-center rounded-md transition",
                    currentPage === totalPages
                      ? "dark:text-dark-500 cursor-not-allowed text-gray-300"
                      : "dark:text-dark-300 dark:hover:bg-dark-600 text-gray-500 hover:bg-gray-100",
                  )}
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>

              {/* Right - Showing count */}
              <div className="dark:text-dark-300 text-sm text-gray-500">
                {startIndex + 1} - {endIndex} of {totalItemsCount} entries
              </div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
