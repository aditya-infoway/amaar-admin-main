import { useState, useMemo, useEffect, useRef } from "react";
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
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router";
import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import {
  Button,
  Card,
  Input,
  GhostSpinner,
  Radio,
  Checkbox,
} from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { statusOptions } from "../../shared/constants";
import { useUnsavedChanges } from "@/app/contexts/unsavedChanges/context";
import { Combobox } from "@/components/shared/form/StyledCombobox";

// Import Dialog components (drawer + centered confirmation popup)
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";

interface BOMItem {
  id: string;
  refItemId: string;
  itemCode: string;
  itemName: string;
  quantity: string;
  unit: string;
  serialNo?: string;

  nextChildSerial?: number;

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

function findNodeById(items: BOMItem[], id: string): BOMItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const found = findNodeById(item.children, id);
    if (found) return found;
  }
  return null;
}

function findPathToNode(
  items: BOMItem[],
  id: string,
  path: BOMItem[] = [],
): BOMItem[] | null {
  for (const item of items) {
    const nextPath = [...path, item];
    if (item.id === id) return nextPath;
    if (item.children.length > 0) {
      const found = findPathToNode(item.children, id, nextPath);
      if (found) return found;
    }
  }
  return null;
}

function collectIds(items: BOMItem[]): string[] {
  return items.flatMap((item) => [item.id, ...collectIds(item.children)]);
}

function countAll(items: BOMItem[]): number {
  return items.reduce((acc, item) => acc + 1 + countAll(item.children), 0);
}

function computeTotalWeight(item: BOMItem): number {
  const ownWeight = parseFloat(item.weight || "0") || 0;
  const childrenWeight = item.children.reduce(
    (sum, child) => sum + computeTotalWeight(child),
    0,
  );
  return ownWeight + childrenWeight;
}

// 👇 NEW: recursively filters a BOMItem tree by search query, keeping a
// node if it matches OR if any of its descendants match (so a matching
// deep child still shows its ancestor chain, same pattern search trees
// commonly use).
function filterTree(items: BOMItem[], query: string): BOMItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  const result: BOMItem[] = [];

  for (const item of items) {
    const selfMatch =
      item.itemCode.toLowerCase().includes(q) ||
      item.itemName.toLowerCase().includes(q);
    const filteredChildren = filterTree(item.children || [], query);

    if (selfMatch || filteredChildren.length > 0) {
      result.push({
        ...item,
        // If this node itself matched, show its full original subtree.
        // If only some descendants matched, show just those descendants.
        children: selfMatch ? item.children : filteredChildren,
      });
    }
  }

  return result;
}

// 👇 NEW: walks a nested BOMItem tree and collects every item whose id is
// in the selected set, at any depth, into a flat array. Each returned
// item keeps its own data but the caller is responsible for stripping
// nested children when inserting into a different tree (handled already
// in handleSubBomConfirmSubmit, which always forces children: []).
// Keeps only selected nodes + their selected descendants.
// Unselected nodes are dropped, but the parent chain of selected
// nodes is preserved so the tree still looks correct.
function collectSelectedTree(
  items: BOMItem[],
  selectedSet: Set<string>,
): BOMItem[] {
  const result: BOMItem[] = [];

  for (const item of items) {
    const selectedChildren = collectSelectedTree(
      item.children || [],
      selectedSet,
    );
    const isSelected = selectedSet.has(item.id);

    if (isSelected || selectedChildren.length > 0) {
      result.push({
        ...item,
        // Only keep selected children (or the full subtree if the
        // node itself is selected — same pattern as filterTree)
        children: isSelected ? item.children : selectedChildren,
      });
    }
  }

  return result;
}

function buildPreviewTree(
  bomItems: BOMItem[],
  parentId: string | null,
  selectedItems: BOMItem[],
): BOMItem[] {
  if (!parentId) {
    // No parent selected → just show the selected items as roots
    return selectedItems;
  }

  // Deep clone the current tree and inject the selected items under the parent
  const clone = (items: BOMItem[]): BOMItem[] =>
    items.map((item) => ({
      ...item,
      children:
        item.id === parentId
          ? [...item.children, ...selectedItems]
          : clone(item.children || []),
    }));

  return clone(bomItems);
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
          Qty: {item.quantity}
          {hasChildren && (
            <span className="text-primary-600 dark:text-primary-400 ml-2">
              Wt: {computeTotalWeight(item).toFixed(2)} kg
            </span>
          )}
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

interface ConfirmTreeProps {
  items: BOMItem[];
  level: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
}

function ConfirmBomTreeList({
  items,
  level,
  expanded,
  onToggle,
}: ConfirmTreeProps) {
  return (
    <ul
      className="relative"
      style={level > 0 ? { paddingLeft: INDENT } : undefined}
    >
      {items.map((item, index) => (
        <ConfirmBomTreeNode
          key={item.id}
          item={item}
          level={level}
          isLast={index === items.length - 1}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}

function ConfirmBomTreeNode({
  item,
  level,
  isLast,
  expanded,
  onToggle,
}: Omit<ConfirmTreeProps, "items"> & { item: BOMItem; isLast: boolean }) {
  const hasChildren = !!item.children && item.children.length > 0;
  const isOpen = !!expanded[item.id];

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
        className="group flex items-center gap-2 rounded-md py-2 pr-2 pl-1"
        style={{ minHeight: ROW_H }}
      >
        {/* Expand/collapse — same as selection tree */}
        <button
          type="button"
          onClick={() => hasChildren && onToggle(item.id)}
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
          Qty: {item.quantity} {item.unit}
        </span>
      </div>

      {hasChildren && isOpen && (
        <ConfirmBomTreeList
          items={item.children}
          level={level + 1}
          expanded={expanded}
          onToggle={onToggle}
        />
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// 👇 NEW: Sub BOM selection tree — same visual style as BOMTreeNode
// (connecting lines, folder/document icons, expand/collapse) but each
// row has a checkbox instead of a highlight/remove action, since this
// tree is for picking items rather than editing the main BOM.
// ---------------------------------------------------------------------------

interface SubBomTreeProps {
  items: BOMItem[];
  level: number;
  expanded: Record<string, boolean>;
  selected: Set<string>;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

function SubBomTreeList({
  items,
  level,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
}: SubBomTreeProps) {
  return (
    <ul
      className="relative"
      style={level > 0 ? { paddingLeft: INDENT } : undefined}
    >
      {items.map((item, index) => (
        <SubBomTreeNode
          key={item.id}
          item={item}
          level={level}
          isLast={index === items.length - 1}
          expanded={expanded}
          selected={selected}
          onToggleExpand={onToggleExpand}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </ul>
  );
}

function SubBomTreeNode({
  item,
  level,
  isLast,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
}: Omit<SubBomTreeProps, "items"> & { item: BOMItem; isLast: boolean }) {
  const hasChildren = !!item.children && item.children.length > 0;
  const isOpen = !!expanded[item.id];
  const isSelected = selected.has(item.id);

  return (
    <li className="relative" style={{ minHeight: ROW_H }}>
      {level > 0 && (
        <>
          <span
            className="dark:bg-dark-500 absolute bg-gray-300"
            style={{
              left: -INDENT + 10 + level * INDENT, // 👈 added level*INDENT shift
              top: 0,
              width: 1,
              height: isLast ? TICK_Y : "100%",
            }}
          />
          <span
            className="dark:bg-dark-500 absolute bg-gray-300"
            style={{
              left: -INDENT + 10 + level * INDENT, // 👈 added level*INDENT shift
              top: TICK_Y,
              width: INDENT - 10,
              height: 1,
            }}
          />
        </>
      )}

      <div
        onClick={() => onToggleSelect(item.id)}
        className={clsx(
          "group flex cursor-pointer items-center gap-2 rounded-md py-2 pr-2 pl-1 transition",
          isSelected
            ? "bg-primary-50 ring-primary-400 dark:bg-primary-900/30 ring-1 ring-inset"
            : "dark:hover:bg-dark-600 hover:bg-gray-50",
        )}
        style={{ minHeight: ROW_H }}
      >
        <span
          className="flex size-5 shrink-0 items-center justify-center"
          style={{ marginLeft: -level * INDENT }} // 👈 pulls checkbox back to a fixed column
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
          />
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(item.id);
          }}
          className="flex size-5 shrink-0 items-center justify-center"
          style={{ marginLeft: level * INDENT }} // 👈 compensates, keeps chevron/icon/text indented as before
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
          Qty: {item.quantity} {item.unit}
        </span>
      </div>

      {hasChildren && isOpen && (
        <SubBomTreeList
          items={item.children}
          level={level + 1}
          expanded={expanded}
          selected={selected}
          onToggleExpand={onToggleExpand}
          onToggleSelect={onToggleSelect}
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

  const [qty, setQty] = useState<string>("");

  const [bomName, setBomName] = useState<string>("");
  const [bomCode, setBomCode] = useState<string>("");
  const [bomStatus, setBomStatus] = useState<string>("active");

  const isLoadingFieldsRef = useRef(false);

  const [isBOMDirty, setIsBOMDirty] = useState(false);
  const [finishedGoodsItemId, setFinishedGoodsItemId] = useState<string>("");
  const [finishedGoodsItems, setFinishedGoodsItems] = useState<any[]>([]);

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [weight, setWeight] = useState<string>("");
  const [weightReadOnly, setWeightReadOnly] = useState<boolean>(true);
  const baseWeightRef = useRef<string>("");

  // Entry mode state
  const [entryMode, setEntryMode] = useState<"normal" | "subBom">("normal");

  // Sub BOM right drawer states
  const [isSubBomDrawerOpen, setIsSubBomDrawerOpen] = useState(false);
  const [subBomItems, setSubBomItems] = useState<BOMItem[]>([]);
  const [selectedSubBomItems, setSelectedSubBomItems] = useState<Set<string>>(
    new Set(),
  );
  const [subBomSearchQuery, setSubBomSearchQuery] = useState("");
  const [subBomDrawerCode, setSubBomDrawerCode] = useState("");
  const [subBomDrawerName, setSubBomDrawerName] = useState("");
  // 👇 NEW: expand/collapse state for the Sub BOM selection tree, kept
  // separate from the main BOM Structure panel's expandedNodes
  const [subBomExpandedNodes, setSubBomExpandedNodes] = useState<
    Record<string, boolean>
  >({});

  const [confirmExpandedNodes, setConfirmExpandedNodes] = useState<
    Record<string, boolean>
  >({});

  // Main BOM save confirmation modal (centered scale-up popup)
  const [isBomConfirmOpen, setIsBomConfirmOpen] = useState(false);
  // Holds selected sub-BOM items after drawer save (added directly on "Add to BOM Structure")
  const [pendingSubBomItems, setPendingSubBomItems] = useState<
    BOMItem[] | null
  >(null);

  useEffect(() => {
    setDirty(isBOMDirty);

    return () => {
      setDirty(false);
    };
  }, [isBOMDirty, setDirty]);

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
      } catch {
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
          setBomItems(data.items || []);
          setExpandedNodes(
            Object.fromEntries(
              collectIds(data.items || []).map((nid: string) => [nid, true]),
            ),
          );
          // finishedGoodsItemId is resolved separately in a useEffect
          // once both bomCode and finishedGoodsItems are populated —
          // the BOM GET endpoint doesn't return a linking id, so we
          // match by bomCode === finished good's itemCode instead.
        } else {
          toasterrormsg(response.data?.message || "Failed to fetch BOM.");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while fetching BOM.");
      } finally {
        requestAnimationFrame(() => {
          isLoadingFieldsRef.current = false;
        });
      }
    };

    const loadFinishedGoodsItems = async () => {
      try {
        const response = await Get(
          "master/itemmaster/finished-goods/list",
          {},
          false,
        );

        if (response.data?.success) {
          setFinishedGoodsItems(response.data.data || []);
        } else {
          setFinishedGoodsItems([]);
          toasterrormsg(
            response.data?.message || "Failed to load Finished Goods.",
          );
        }
      } catch (error) {
        console.error("Finished Goods API Error:", error);
        setFinishedGoodsItems([]);
        toasterrormsg("Something went wrong while loading Finished Goods.");
      }
    };

    const load = async () => {
      setLoading(true);
      await loadAvailableItems();
      await loadFinishedGoodsItems();
      await loadExistingBom();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Resolve the BOM Name Combobox selection in edit mode.
  // The GET /master/bom/:id response has no finishedGoodsItemId field,
  // so we match the finished-goods item whose itemCode equals this
  // BOM's bomCode (bomCode is always set from the FG's itemCode when
  // a user picks it in the Combobox onChange below).
  useEffect(() => {
    if (!isEditMode) return;
    if (finishedGoodsItemId) return; // already resolved
    if (!bomCode || finishedGoodsItems.length === 0) return;

    const matched = finishedGoodsItems.find(
      (fg) =>
        String(fg.itemCode).toLowerCase() === String(bomCode).toLowerCase(),
    );

    if (matched) {
      setFinishedGoodsItemId(String(matched.itemId));
    }
  }, [isEditMode, bomCode, finishedGoodsItems, finishedGoodsItemId]);

  const totalItems = useMemo(() => countAll(bomItems), [bomItems]);
  const hasBOMItems = bomItems.length > 0;

  const nextSerialPreview = useMemo(() => {
    if (!hasBOMItems) {
      return String(bomItems.length + 1);
    }
    if (!selectedParentId) return "";
    const parentNode = findNodeById(bomItems, selectedParentId);
    const existingCount = parentNode ? parentNode.children.length : 0;
    return String(existingCount + 1);
  }, [bomItems, hasBOMItems, selectedParentId]);

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

  const totalItemsCount = filteredAvailableItems.length;
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItemsCount);
  const currentItems = filteredAvailableItems.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

    setSelectedParentId(item.id);
    setParentCode(item.itemCode);
    setChildCode("");
    resetEntryFields();

    setExpandedNodes((prev) => ({
      ...prev,
      [item.id]: true,
    }));

    requestAnimationFrame(() => {
      isLoadingFieldsRef.current = false;
    });
  };

  const markBOMDirty = () => {
    setIsBOMDirty(true);
  };

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

  const fillItemDimensions = (item: AvailableItem) => {
    setThickness(item.thickness || "");
    setLength(item.length || "");
    setWidth(item.width || "");

    const baseWeight = parseFloat(item.weight || "");
    const currentQty = parseFloat(qty || "");

    if (!isNaN(baseWeight)) {
      baseWeightRef.current = item.weight || "";
      setWeightReadOnly(true);

      if (!isNaN(currentQty) && currentQty > 0) {
        setWeight((baseWeight * currentQty).toFixed(3));
      } else {
        setWeight("");
      }
    } else {
      baseWeightRef.current = "";
      setWeightReadOnly(false);
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
    baseWeightRef.current = "";
    setWeightReadOnly(true);

    setQty("");
  };

  const getNextSerialNo = (parentId: string | null): string => {
    if (!parentId) {
      return String(bomItems.length + 1);
    }

    const parentNode = findNodeById(bomItems, parentId);
    const existingCount = parentNode ? parentNode.children.length : 0;

    return String(existingCount + 1);
  };

  // Fetch sub BOM items for the drawer using the API
  const fetchSubBomItems = async (code: string) => {
    try {
      const response = await Get(`master/bom/sub-bom/${code}`, {}, false);
      if (response.data?.success) {
        const data = response.data.data;
        const items = data.items || [];
        setSubBomItems(items);
        setSubBomDrawerCode(data.bomCode || code);
        setSubBomDrawerName(data.bomName || code);
        // Start with nothing selected — user picks manually
        setSelectedSubBomItems(new Set());
        // 👇 NEW: auto-expand every node so the full nested structure is
        // visible immediately, matching the BOM Structure panel's default
        setSubBomExpandedNodes(
          Object.fromEntries(
            collectIds(items).map((nid: string) => [nid, true]),
          ),
        );
        setIsSubBomDrawerOpen(true);
      } else {
        toasterrormsg(
          response.data?.message || "Failed to fetch Sub BOM items.",
        );
        setIsSubBomDrawerOpen(false);
      }
    } catch (error) {
      console.error("Fetch Sub BOM Error:", error);
      toasterrormsg("Something went wrong while fetching Sub BOM.");
      setIsSubBomDrawerOpen(false);
    }
  };

  // Handle search icon click in Sub BOM mode
  const handleSubBomSearch = () => {
    if (!childCode.trim()) {
      toasterrormsg("Please enter a Child item code first.");
      return;
    }

    const childItem = findAvailableByCode(childCode);
    if (!childItem) {
      toasterrormsg(`Item code "${childCode}" not found in Item Master.`);
      return;
    }

    fetchSubBomItems(childCode);
  };

  // Toggle sub BOM item selection
  const toggleSubBomItem = (itemId: string) => {
    setSelectedSubBomItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 👇 NEW: Toggle expand/collapse for a node in the Sub BOM selection tree
  const toggleSubBomNode = (nid: string) => {
    setSubBomExpandedNodes((prev) => ({ ...prev, [nid]: !prev[nid] }));
  };

  const toggleConfirmNode = (nid: string) => {
    setConfirmExpandedNodes((prev) => ({ ...prev, [nid]: !prev[nid] }));
  };

  // 👇 CHANGED: Toggle all sub BOM items — now walks the full nested tree
  // (via collectIds) against whatever is currently visible (filtered),
  // instead of only the old flat top-level list.
  const toggleAllSubBomItems = () => {
    const visibleIds = collectIds(filteredSubBomItems);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((vid) => selectedSubBomItems.has(vid));

    if (allVisibleSelected) {
      setSelectedSubBomItems((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((vid) => next.delete(vid));
        return next;
      });
    } else {
      setSelectedSubBomItems((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((vid) => next.add(vid));
        return next;
      });
    }
  };

  // Save sub BOM drawer selection (closes drawer, returns to entry panel)
  // Items are stored as pending and added directly when user clicks "Add to BOM Structure"
  const handleSubBomDrawerSave = () => {
    if (selectedSubBomItems.size === 0) {
      toasterrormsg("Please select at least one item from the BOM.");
      return;
    }

    const selectedItems = collectSelectedTree(subBomItems, selectedSubBomItems);

    setPendingSubBomItems(selectedItems);

    setIsSubBomDrawerOpen(false);
    setSubBomItems([]);
    setSelectedSubBomItems(new Set());
    setSubBomSearchQuery("");
    setSubBomExpandedNodes({});

    toastsuccessmsg(
      `${selectedItems.length} item(s) selected from sub BOM. Click "Add to BOM Structure" to add them.`,
    );
  };

  // Directly insert selected sub-BOM items into the tree (no intermediate confirm)
  const addPendingSubBomItems = () => {
    if (!pendingSubBomItems || pendingSubBomItems.length === 0) {
      toasterrormsg("No items selected to add.");
      return;
    }

    if (!selectedParentId) {
      toasterrormsg("Please select a parent item before adding sub BOM items.");
      return;
    }

    const selectedItems = pendingSubBomItems;
    const parentNode = findNodeById(bomItems, selectedParentId);
    let serialCounter = parentNode ? parentNode.children.length + 1 : 1;

    const cloneTree = (items: BOMItem[]): BOMItem[] => {
      return items
        .map((item) => {
          const isDuplicate = parentNode?.children.some(
            (child) =>
              child.itemCode.toLowerCase() === item.itemCode.toLowerCase(),
          );

          if (isDuplicate && items === selectedItems) {
            return null as any;
          }

          const newId =
            Date.now().toString() + Math.random().toString(36).slice(2, 6);

          return {
            ...item,
            id: newId,
            serialNo: String(serialCounter++),
            quantity: item.quantity || "1",
            children: item.children?.length ? cloneTree(item.children) : [],
          };
        })
        .filter(Boolean);
    };

    const newItems = cloneTree(selectedItems);

    if (newItems.length === 0) {
      toasterrormsg("Selected items are already present in this BOM.");
      setPendingSubBomItems(null);
      return;
    }

    let updatedItems = [...bomItems];
    newItems.forEach((item) => {
      updatedItems = insertItem(updatedItems, selectedParentId, item);
    });

    setBomItems(updatedItems);
    setIsBOMDirty(true);
    setExpandedNodes((prev) => ({
      ...prev,
      [selectedParentId as string]: true,
    }));

    setChildCode("");
    resetEntryFields();
    setPendingSubBomItems(null);

    toastsuccessmsg(
      `${collectIds(newItems).length} item(s) added from sub BOM (hierarchy preserved).`,
    );
  };

  // 👇 CHANGED: Filter sub BOM items for search — now uses the recursive
  // filterTree helper so matches at any depth keep their ancestor chain
  // visible, instead of only filtering a flat top-level list.
  // Avoid manual memoization here: the filter is cheap and React Compiler
  // cannot preserve the existing useMemo optimization for this tree-shaped data.
  const filteredSubBomItems = filterTree(subBomItems, subBomSearchQuery);

  const handleAddToTree = () => {
    // FIRST ROOT ITEM
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

      const rootSerial = getNextSerialNo(null);
      rootItem.serialNo = rootSerial;

      setBomItems([rootItem]);
      setSelectedParentId(rootItem.id);
      setParentCode(rootItem.itemCode);
      setIsBOMDirty(true);
      resetEntryFields();
      toastsuccessmsg(`Root item added with Serial# ${rootSerial}.`);
      return;
    }

    // CHILD ITEM
    if (!childCode.trim()) {
      toasterrormsg("Please enter the Child item code.");
      return;
    }

    if (!selectedParentId) {
      toasterrormsg("Please select a Parent item before adding a Child.");
      return;
    }

    // In Sub BOM mode:
    // - If items were already picked from the drawer, add them directly.
    // - Otherwise, open the drawer to pick items.
    if (entryMode === "subBom") {
      if (pendingSubBomItems && pendingSubBomItems.length > 0) {
        addPendingSubBomItems();
        return;
      }

      const childItem = findAvailableByCode(childCode);
      if (!childItem) {
        toasterrormsg(`Item code "${childCode}" not found in Item Master.`);
        return;
      }

      fetchSubBomItems(childCode);
      return;
    }

    // NORMAL MODE
    const newItem = buildItem(childCode);

    if (!newItem) {
      toasterrormsg(
        `Item code "${childCode}" not found in Item Master. Please enter a valid, existing item code.`,
      );
      return;
    }

    const parentNode = findNodeById(bomItems, selectedParentId);
    const isDuplicateSibling = parentNode?.children.some(
      (child) =>
        child.itemCode.toLowerCase() === newItem.itemCode.toLowerCase(),
    );

    if (isDuplicateSibling) {
      toasterrormsg(
        `"${newItem.itemCode}" is already added under this parent.`,
      );
      return;
    }

    const ancestorChain = findPathToNode(bomItems, selectedParentId) || [];
    const createsCycle = ancestorChain.some(
      (ancestor) =>
        ancestor.itemCode.toLowerCase() === newItem.itemCode.toLowerCase(),
    );

    if (createsCycle) {
      toasterrormsg(
        `Cannot add "${newItem.itemCode}" here — it is already a parent of this item further up the tree, which would create a circular reference.`,
      );
      return;
    }

    const newSerialNo = getNextSerialNo(selectedParentId);
    newItem.serialNo = newSerialNo;

    setBomItems((prev) => insertItem(prev, selectedParentId, newItem));
    setIsBOMDirty(true);
    setExpandedNodes((prev) => ({
      ...prev,
      [selectedParentId]: true,
    }));

    setChildCode("");
    resetEntryFields();
    toastsuccessmsg(`Child item added with Serial# ${newSerialNo}.`);
  };

  // Opens the centered read-only confirmation popup before saving
  const handleSaveBOM = () => {
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

    setConfirmExpandedNodes(
      Object.fromEntries(collectIds(bomItems).map((nid) => [nid, true])),
    );
    setIsBomConfirmOpen(true);
  };

  // Actual create / update after user confirms in the popup
  const handleConfirmSaveBOM = async () => {
    setIsBomConfirmOpen(false);

    try {
      if (isEditMode) {
        const payload = {
          bomId: Number(id),
          bomName,
          bomCode,
          status: bomStatus,
          items: bomItems,
        };

        const response = await Put("master/bom/update", payload, false);

        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "BOM updated successfully.",
          );
          setIsBOMDirty(false);
          setDirty(false);
          setTimeout(() => {
            navigate("/master/item-master/bom");
          }, 0);
        } else {
          toasterrormsg(response.data?.message || "Failed to update BOM.");
        }
        return;
      }

      const payload = {
        bomName,
        bomCode,
        status: bomStatus,
        items: bomItems,
      };

      const response = await Post("master/bom/create", payload, false);

      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "BOM created successfully.");
        setIsBOMDirty(false);
        setDirty(false);
        setTimeout(() => {
          navigate("/master/item-master/bom");
        }, 0);
      } else {
        toasterrormsg(response.data?.message || "Failed to create BOM.");
      }
    } catch (error) {
      console.error("BOM save error:", error);
      toasterrormsg(
        isEditMode
          ? "Something went wrong while updating BOM."
          : "Something went wrong while creating BOM.",
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
            onClick={() => handleProtectedNavigation("/master/item-master/bom")}
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
            <Combobox
              label="BOM Name"
              data={finishedGoodsItems}
              displayField="itemName"
              value={
                finishedGoodsItems.find(
                  (item) => String(item.itemId) === String(finishedGoodsItemId),
                ) || null
              }
              onChange={(item: any) => {
                if (!item) {
                  setFinishedGoodsItemId("");
                  setBomName("");
                  setBomCode("");
                  setIsBOMDirty(true);
                  return;
                }
                setFinishedGoodsItemId(String(item.itemId));
                setBomName(item.itemName || "");
                setBomCode(item.itemCode || "");
                setIsBOMDirty(true);
              }}
              placeholder="Select Finished Goods"
              searchFields={["itemCode", "itemName"]}
            />
            <Input
              label="BOM Code"
              value={bomCode}
              readOnly
              placeholder="Auto generated "
              className="dark:bg-dark-700/50 cursor-not-allowed bg-gray-50"
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
                    highlightId={selectedParentId ?? matchedParent?.id ?? null}
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
                  <>
                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Entry Mode
                      </label>
                      <div className="flex gap-6">
                        <Radio
                          checked={entryMode === "normal"}
                          onChange={() => {
                            setEntryMode("normal");
                            setIsSubBomDrawerOpen(false);
                            setPendingSubBomItems(null);
                          }}
                          label="Child"
                        />
                        <Radio
                          checked={entryMode === "subBom"}
                          onChange={() => setEntryMode("subBom")}
                          label="Sub BOM"
                        />
                      </div>
                      {entryMode === "subBom" && (
                        <p className="dark:text-dark-400 mt-1 text-xs text-gray-400">
                          Enter a child code and click the search icon to select
                          items from its BOM.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        {entryMode === "subBom" ? "Sub BOM" : "Child"}
                      </label>
                      <div className="relative">
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
                              baseWeightRef.current = "";
                              setWeightReadOnly(true);
                            }
                          }}
                          placeholder="Item code to add under Parent"
                          className={entryMode === "subBom" ? "pr-10" : ""}
                        />
                        {entryMode === "subBom" && (
                          <button
                            type="button"
                            onClick={handleSubBomSearch}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MagnifyingGlassIcon className="cursor- size-4" />
                          </button>
                        )}
                      </div>
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
                  </>
                )}

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                      Serial#
                    </label>
                    <Input
                      value={nextSerialPreview}
                      readOnly
                      placeholder="Serial#"
                      className="dark:bg-dark-700/50 cursor-not-allowed bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                      Assly Qty
                    </label>
                    <Input
                      type="number"
                      value={asslyQty}
                      onChange={(e) => setAsslyQty(e.target.value)}
                      placeholder="Assly Qty"
                    />
                  </div>
                </div> */}

                <div className="dark:border-dark-500 mt-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
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

                      <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Qty
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          setQty(value);

                          const quantity = parseFloat(value || "");
                          const baseWeight = parseFloat(
                            baseWeightRef.current || "",
                          );

                          if (
                            !isNaN(baseWeight) &&
                            !isNaN(quantity) &&
                            quantity > 0
                          ) {
                            setWeight((baseWeight * quantity).toFixed(3));
                          } else if (weightReadOnly) {
                            setWeight("");
                          }
                        }}
                        placeholder="Qty"
                      />
                    </div>

                    <div>
                      <label className="dark:text-dark-300 mb-2 block text-sm font-medium text-gray-700">
                        Weight (kg)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={weight}
                        readOnly={weightReadOnly}
                        onChange={
                          weightReadOnly
                            ? undefined
                            : (e) => {
                                const val = e.target.value;
                                setWeight(val);
                                const enteredWeight = parseFloat(val || "");
                                const currentQty = parseFloat(qty || "");

                                if (isNaN(enteredWeight)) {
                                  baseWeightRef.current = "";
                                } else if (
                                  !isNaN(currentQty) &&
                                  currentQty > 0
                                ) {
                                  baseWeightRef.current = (
                                    enteredWeight / currentQty
                                  ).toString();
                                } else {
                                  baseWeightRef.current = val;
                                }
                              }
                        }
                        placeholder={
                          weightReadOnly ? "Auto calculated" : "Enter weight"
                        }
                        className={
                          weightReadOnly
                            ? "dark:bg-dark-700/50 cursor-not-allowed bg-gray-50"
                            : undefined
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                  
                  </div>
                </div>
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
              </div>
            </Card>
          </div>
        </div>

        <div className="my-6 flex justify-end gap-3">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleProtectedNavigation("/master/item-master/bom")}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={handleSaveBOM}>
            {isEditMode ? "Update BOM" : "Create BOM"}
          </Button>
        </div>

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

          {totalItemsCount > 0 && (
            <div className="dark:border-dark-500 flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 sm:flex-row">
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

              <div className="dark:text-dark-300 text-sm text-gray-500">
                {startIndex + 1} - {endIndex} of {totalItemsCount} entries
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Sub BOM Right Drawer */}
      <Transition appear show={isSubBomDrawerOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={() => {
            setIsSubBomDrawerOpen(false);
            setSelectedSubBomItems(new Set());
            setSubBomItems([]);
            setSubBomSearchQuery("");
            setSubBomExpandedNodes({});
          }}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-800 fixed top-0 right-0 flex h-full w-full max-w-7xl transform-gpu flex-col bg-white transition-transform duration-300">
              {/* Header */}
              <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div>
                  <h3 className="dark:text-dark-100 text-lg font-medium text-gray-900">
                    Select Items from Sub BOM
                  </h3>
                  <p className="dark:text-dark-300 text-sm text-gray-500">
                    BOM: {subBomDrawerCode} — {collectIds(subBomItems).length}{" "}
                    items available
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSubBomDrawerOpen(false);
                    setSelectedSubBomItems(new Set());
                    setSubBomItems([]);
                    setSubBomSearchQuery("");
                    setSubBomExpandedNodes({});
                  }}
                  className="dark:hover:bg-dark-600 rounded-md p-1.5 hover:bg-gray-100"
                >
                  <XMarkIcon className="size-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={subBomSearchQuery}
                      onChange={(e) => setSubBomSearchQuery(e.target.value)}
                      placeholder="Search items..."
                      className="pl-9"
                    />
                  </div>
                  <button
                    onClick={toggleAllSubBomItems}
                    className="dark:text-dark-300 cursor-pointer text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    {collectIds(filteredSubBomItems).length > 0 &&
                    collectIds(filteredSubBomItems).every((vid) =>
                      selectedSubBomItems.has(vid),
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <span className="dark:text-dark-300 text-sm text-gray-500">
                    {selectedSubBomItems.size} selected
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {filteredSubBomItems.length === 0 ? (
                    <div className="dark:text-dark-300 py-8 text-center text-gray-500">
                      {subBomSearchQuery
                        ? "No items match your search"
                        : "No items in this BOM"}
                    </div>
                  ) : (
                    <SubBomTreeList
                      items={filteredSubBomItems}
                      level={0}
                      expanded={subBomExpandedNodes}
                      selected={selectedSubBomItems}
                      onToggleExpand={toggleSubBomNode}
                      onToggleSelect={toggleSubBomItem}
                    />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="dark:border-dark-500 dark:bg-dark-800 flex justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setIsSubBomDrawerOpen(false);
                    setSelectedSubBomItems(new Set());
                    setSubBomItems([]);
                    setSubBomSearchQuery("");
                    setSubBomExpandedNodes({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onClick={handleSubBomDrawerSave}
                  disabled={selectedSubBomItems.size === 0}
                >
                  Save ({selectedSubBomItems.size})
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* BOM Save Confirmation — centered scale-up popup (read-only view) */}
      <Transition appear show={isBomConfirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={() => setIsBomConfirmOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="dark:bg-dark-700 relative flex w-full max-w-2xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300">
              {/* Header */}
              <div className="dark:bg-dark-800 flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 sm:px-5">
                <DialogTitle
                  as="h3"
                  className="dark:text-dark-100 text-base font-medium text-gray-800"
                >
                  {isEditMode ? "Confirm Update BOM" : "Confirm Create BOM"}
                </DialogTitle>
                <Button
                  onClick={() => setIsBomConfirmOpen(false)}
                  variant="flat"
                  isIcon
                  className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                >
                  <XMarkIcon className="size-4.5" />
                </Button>
              </div>

              {/* Body — same layout as old confirm: Parent once, then Sub BOM tree */}
              <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                {/* Main Parent (root) — shown only once */}
                {bomItems[0] && (
                  <div className="dark:bg-dark-700/50 mb-5 rounded-lg bg-gray-50 p-4">
                    <p className="dark:text-dark-400 text-2xl font-bold text-gray-800">
                      Parent
                    </p>
                    <p className="dark:text-dark-200 text-xl font-medium text-gray-900">
                      {bomItems[0].itemCode} - {bomItems[0].itemName}
                    </p>
                  </div>
                )}

                {/* Sub BOM heading + tree (children of root) */}
                <h1 className="dark:text-dark-100 mb-3 text-2xl font-semibold text-gray-800">
                  Sub BOM
                </h1>

                <div className="mb-2 flex items-center justify-between">
                  <span className="dark:text-dark-300 text-sm text-gray-500">
                    {Math.max(totalItems - (bomItems[0] ? 1 : 0), 0)} item(s)
                  </span>
                </div>

                <div className="max-h-[360px] overflow-y-auto pr-1">
                  {!bomItems[0]?.children?.length ? (
                    <div className="dark:text-dark-300 py-8 text-center text-gray-500">
                      No sub items
                    </div>
                  ) : (
                    <ConfirmBomTreeList
                      items={bomItems[0].children}
                      level={0}
                      expanded={confirmExpandedNodes}
                      onToggle={toggleConfirmNode}
                    />
                  )}
                </div>

                <div className="mt-5 space-x-3 text-end">
                  <Button
                    onClick={() => setIsBomConfirmOpen(false)}
                    variant="outlined"
                    className="min-w-[7rem] rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSaveBOM}
                    color="primary"
                    className="min-w-[7rem] rounded-full"
                  >
                    {isEditMode ? "Update BOM" : "Create BOM"}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </Page>
  );
}
