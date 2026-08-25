import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  FolderIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router";
import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Button, Card, GhostSpinner, Badge } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";

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
  length?: string;
  width?: string;
  children: BOMItem[];
}

interface BOMDetail {
  bomId: string;
  bomName: string;
  bomCode: string;
  status: string;
  items: BOMItem[];
}

// ---------------------------------------------------------------------------
// Tree helpers — sirf collect/count chahiye yahan (read-only view)
// ---------------------------------------------------------------------------
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
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
}

// Same visual tree jaisa Create/Edit page me hai — sirf click-to-pick aur
// remove-button hataye gaye hain, kyunki ye purely read-only view hai.
function BOMTreeList({ items, level, expanded, onToggle }: TreeProps) {
  return (
    <ul className="relative" style={level > 0 ? { paddingLeft: INDENT } : undefined}>
      {items.map((item, index) => (
        <BOMTreeNode
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

function BOMTreeNode({
  item,
  level,
  isLast,
  expanded,
  onToggle,
}: Omit<TreeProps, "items"> & { item: BOMItem; isLast: boolean }) {
  const hasChildren = item.children.length > 0;
  const isOpen = !!expanded[item.id];

  return (
    <li className="relative" style={{ minHeight: ROW_H }}>
      {level > 0 && (
        <>
          <span
            className="absolute bg-gray-300 dark:bg-dark-500"
            style={{
              left: -INDENT + 10,
              top: 0,
              width: 1,
              height: isLast ? TICK_Y : "100%",
            }}
          />
          <span
            className="absolute bg-gray-300 dark:bg-dark-500"
            style={{ left: -INDENT + 10, top: TICK_Y, width: INDENT - 10, height: 1 }}
          />
        </>
      )}

      <div
        className="group flex items-center gap-2 rounded-md py-2 pl-1 pr-2 hover:bg-gray-50 dark:hover:bg-dark-600"
        style={{ minHeight: ROW_H }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(item.id)}
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

        <span className="shrink-0 text-xs font-semibold text-gray-600 dark:text-dark-300">
          Qty: {item.quantity}
        </span>
        {item.unit && (
          <span className="shrink-0 text-xs text-gray-400 dark:text-dark-400">{item.unit}</span>
        )}
      </div>

      {hasChildren && isOpen && (
        <BOMTreeList items={item.children} level={level + 1} expanded={expanded} onToggle={onToggle} />
      )}
    </li>
  );
}

export default function BOMViewPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [bom, setBom] = useState<BOMDetail | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await Get(`master/bom/${id}`, {}, false);
        if (response.data?.success) {
          const data = response.data.data as BOMDetail;
          setBom(data);
          // View page pe default sab nodes expanded dikhao
          setExpandedNodes(
            Object.fromEntries(collectIds(data.items).map((nid) => [nid, true]))
          );
        } else {
          toasterrormsg(response.data?.message || "Failed to fetch BOM.");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while fetching BOM.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const toggleNode = (nid: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nid]: !prev[nid] }));
  };

  const totalItems = useMemo(() => (bom ? countAll(bom.items) : 0), [bom]);

  if (loading) {
    return (
      <Page title="View BOM">
        <div className="flex h-64 w-full items-center justify-center">
          <GhostSpinner className="size-8 border-4" />
        </div>
      </Page>
    );
  }

  if (!bom) {
    return (
      <Page title="View BOM">
        <div className="py-16 text-center text-gray-500 dark:text-dark-300">
          BOM not found.
          <div className="mt-4">
            <Link to="/master/bom">
              <Button color="primary" variant="outlined">
                <ChevronLeftIcon className="size-5" />
                <span>Back to BOM List</span>
              </Button>
            </Link>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="View BOM">
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="border-b-4 border-primary text-xl font-bold tracking-wide text-primary dark:text-dark-50 lg:text-2xl">
            View BOM
          </h2>
          <Link to="/master/bom">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        {/* BOM Details — read only */}
        <Card className="mb-6 p-3">
          <div className="mb-4 border-b border-gray-200 pb-4 dark:border-dark-500">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">BOM Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-dark-300">BOM Name</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-dark-50">{bom.bomName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-dark-300">BOM Code</p>
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-dark-50">{bom.bomCode}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-dark-300">Status</p>
              <Badge color={bom.status === "active" ? "success" : "neutral"} className="mt-1">
                {bom.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* BOM Structure — read-only tree, same layout as Create/Edit page */}
        <Card className="p-3">
          <div className="mb-4 border-b border-gray-200 pb-4 dark:border-dark-500">
            <h3 className="text-lg font-medium text-gray-800 dark:text-dark-100">BOM Structure</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
              {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? "s" : ""}` : "No items in this BOM"}
            </p>
          </div>

          <div className="max-h-[600px] space-y-1 overflow-y-auto pr-1">
            {bom.items.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-dark-300">No items in this BOM.</div>
            ) : (
              <BOMTreeList items={bom.items} level={0} expanded={expandedNodes} onToggle={toggleNode} />
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}