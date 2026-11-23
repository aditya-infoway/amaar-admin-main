import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  FolderIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { ItemGroup } from "./data";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

interface SubRow {
  id: string;
  name: string;
  groupId: string;
  parentId: string | null;
  status?: string;
}

interface TreeNodeData {
  row: SubRow;
  children: TreeNodeData[];
}

interface Props {
  isOpen: boolean;
  close: () => void;
  group: ItemGroup | null; // jis group pe View click hua
}

interface NodeProps {
  node: TreeNodeData;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
}

const LIST_VIEW_THRESHOLD = 30; // isse zyada sub groups pe List default

const treeCss = `
.sg-tree{--line:#cbd5e1}
.dark .sg-tree{--line:#4b5563}
.sg-tree ul{display:flex;justify-content:center;padding-top:28px;position:relative;margin:0;list-style:none}
.sg-tree > ul{padding-top:0}
.sg-tree li{position:relative;padding:28px 12px 0;display:flex;flex-direction:column;align-items:center}
.sg-tree li::before,.sg-tree li::after{content:"";position:absolute;top:0;right:50%;width:50%;height:28px;border-top:2px solid var(--line)}
.sg-tree li::after{right:auto;left:50%;border-left:2px solid var(--line)}
.sg-tree li:only-child::before,.sg-tree li:only-child::after{display:none}
.sg-tree li:only-child{padding-top:28px}
.sg-tree li:first-child::before,.sg-tree li:last-child::after{border:0 none}
.sg-tree li:last-child::before{border-right:2px solid var(--line);border-radius:0 10px 0 0}
.sg-tree li:first-child::after{border-radius:10px 0 0 0}
.sg-tree ul ul::before{content:"";position:absolute;top:0;left:50%;border-left:2px solid var(--line);height:28px}
.sg-tree > ul > li{padding-top:0}
.sg-tree > ul > li::before,.sg-tree > ul > li::after{display:none}
`;

function buildTree(rows: SubRow[]): TreeNodeData[] {
  const ids = new Set(rows.map((r) => r.id));
  const byParent: Record<string, SubRow[]> = {};

  rows.forEach((r) => {
    // parent list me nahi mila (deleted etc.) to root treat karo
    const key = r.parentId && ids.has(r.parentId) ? r.parentId : "root";
    (byParent[key] ||= []).push(r);
  });

  const visited = new Set<string>(); // cycle se bachne ke liye
  const make = (key: string): TreeNodeData[] =>
    (byParent[key] || [])
      .filter((r) => !visited.has(r.id) && visited.add(r.id))
      .map((r) => ({ row: r, children: make(r.id) }));

  return make("root");
}

const countAll = (nodes: TreeNodeData[]): number =>
  nodes.reduce((n, x) => n + 1 + countAll(x.children), 0);

// sirf wo node ids jinke bacche hain (Expand all ke liye)
const collectParentIds = (nodes: TreeNodeData[]): string[] =>
  nodes.flatMap((n) =>
    n.children.length ? [n.row.id, ...collectParentIds(n.children)] : [],
  );

const statusBadge = (active: boolean) =>
  active
    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
    : "dark:bg-dark-500 dark:text-dark-200 bg-gray-100 text-gray-600";

// ---------------- TREE VIEW NODE ----------------
function Node({ node, isOpen, toggle }: NodeProps) {
  const active = node.row.status?.toLowerCase() === "active";
  const hasKids = node.children.length > 0;
  const open = isOpen(node.row.id);

  return (
    <li>
      <div className="group hover:border-primary-300 dark:border-dark-400 dark:bg-dark-700 relative max-w-[210px] min-w-[160px] rounded-xl border border-gray-300 bg-white px-5 py-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)] dark:shadow-lg">
        {/* Icon */}
        <div className="bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 mx-auto mb-3 flex size-10 items-center justify-center rounded-xl transition-colors">
          <FolderIcon className="size-5" />
        </div>

        {/* Subgroup Name */}
        <p className="text-sm font-semibold break-words text-gray-800 dark:text-gray-100">
          {node.row.name}
        </p>

        {/* Status and Children */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {node.row.status && (
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-[10px] font-semibold capitalize",
                statusBadge(active),
              )}
            >
              {node.row.status}
            </span>
          )}

          {hasKids && (
            <button
              type="button"
              onClick={() => toggle(node.row.id)}
              className="hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-dark-400 dark:bg-dark-600 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
            >
              {node.children.length} subgroups
              {open ? (
                <ChevronDownIcon className="size-3" />
              ) : (
                <ChevronRightIcon className="size-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {hasKids && open && (
        <ul>
          {node.children.map((c) => (
            <Node key={c.row.id} node={c} isOpen={isOpen} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------- LIST VIEW NODE (sirf vertical scroll) ----------------
function ListNode({
  node,
  depth,
  isOpen,
  toggle,
}: NodeProps & { depth: number }) {
  const hasKids = node.children.length > 0;
  const open = isOpen(node.row.id);
  const active = node.row.status?.toLowerCase() === "active";

  return (
    <>
      <div
        className="dark:hover:bg-dark-600 flex items-center gap-2 rounded-lg py-1.5 pr-2 hover:bg-gray-100"
        style={{ paddingLeft: depth * 20 + 8 }}
      >
        <button
          type="button"
          onClick={() => hasKids && toggle(node.row.id)}
          className={clsx("size-5 shrink-0", !hasKids && "invisible")}
        >
          {open ? (
            <ChevronDownIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          )}
        </button>
        <FolderIcon className="text-primary-500 size-4 shrink-0" />
        <span className="dark:text-dark-50 grow text-sm break-words text-gray-800">
          {node.row.name}
        </span>
        {hasKids && (
          <span className="text-[10px] text-gray-500">
            {node.children.length} sub
          </span>
        )}
        {node.row.status && (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[10px] capitalize",
              statusBadge(active),
            )}
          >
            {node.row.status}
          </span>
        )}
      </div>
      {hasKids &&
        open &&
        node.children.map((c) => (
          <ListNode
            key={c.row.id}
            node={c}
            depth={depth + 1}
            isOpen={isOpen}
            toggle={toggle}
          />
        ))}
    </>
  );
}

// ---------------- MAIN ----------------
export function ItemGroupTreeModal({ isOpen, close, group }: Props) {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"tree" | "list">("tree");

  // modal khulte hi sub group list laao
  useEffect(() => {
    if (!isOpen || !group?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setRows([]);
      setExpanded(new Set());
      try {
        // 👇 apna sub group list route yahan check kar lena
        const res = await Get("master/subgroup/list", {}, false);
        const list: any[] = res?.data?.data || [];
        if (cancelled) return;

        const mapped: SubRow[] = list
          .filter((s) => String(s.groupId) === String(group.id))
          .map((s) => ({
            id: String(s.subGroupId),
            name: s.subGroupName,
            groupId: String(s.groupId),
            parentId:
              s.parentSubGroupId != null ? String(s.parentSubGroupId) : null,
            status: s.status,
          }));

        setView(mapped.length > LIST_VIEW_THRESHOLD ? "list" : "tree");
        setRows(mapped);
      } catch (e) {
        // ignore, empty state dikhega
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, group?.id]);

  const tree = useMemo(() => buildTree(rows), [rows]);
  const total = useMemo(() => countAll(tree), [tree]);

  const isNodeOpen = (id: string) => expanded.has(id);
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        {/* Backdrop */}
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        {/* Right side drawer (Edit/Create jaisa) */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
          {/* Header */}
          <div className="bg-primary-600 dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Group Hierarchy
              </h3>
              <p className="text-xs text-white/80">
                {group?.groupName} • {total} sub group{total === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {/* Toolbar */}
          {tree.length > 0 && (
            <div className="dark:border-dark-500 flex flex-wrap items-center justify-end gap-2 border-b border-gray-200 px-4 py-3 sm:px-5">
              {/* Expand All */}
              <button
                type="button"
                onClick={() => setExpanded(new Set(collectParentIds(tree)))}
                title="Expand All"
                aria-label="Expand All"
                className="hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-dark-400 dark:bg-dark-600 flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition dark:text-gray-300"
              >
                <PlusIcon className="size-5" />
              </button>

              {/* Collapse All */}
              <button
                type="button"
                onClick={() => setExpanded(new Set())}
                title="Collapse All"
                aria-label="Collapse All"
                className="hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-dark-400 dark:bg-dark-600 flex size-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition dark:text-gray-300"
              >
                <MinusIcon className="size-5" />
              </button>

              {/* Tree View */}
              <Button
                color={view === "tree" ? "primary" : undefined}
                onClick={() => setView("tree")}
              >
                Tree
              </Button>

              {/* List View */}
              <Button
                color={view === "list" ? "primary" : undefined}
                onClick={() => setView("list")}
              >
                List
              </Button>
            </div>
          )}

          {/* Body */}
          <div className="dark:bg-dark-800 grow overflow-auto bg-gray-50 p-6">
            {view === "tree" ? (
              <>
                <style>{treeCss}</style>
                <div className="sg-tree inline-block min-w-full">
                  <ul>
                    <li>
                      {/* Main group (top) */}
                      <div className="dark:border-dark-400 dark:bg-dark-700 min-w-[220px] rounded-2xl border border-gray-300 bg-white px-6 py-4 text-center shadow-md transition-all">
                        <div className="dark:bg-dark-500 mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:text-gray-200">
                          <Squares2X2Icon className="size-5" />
                        </div>

                        <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                          {group?.categoryName || "Main Group"}
                        </p>

                        <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                          {group?.groupName}
                        </p>

                        <span className="dark:bg-dark-500 mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                          Main Group
                        </span>
                      </div>
                      {tree.length > 0 && (
                        <ul>
                          {tree.map((n) => (
                            <Node
                              key={n.row.id}
                              node={n}
                              isOpen={isNodeOpen}
                              toggle={toggle}
                            />
                          ))}
                        </ul>
                      )}
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div>
                {/* Main group header row */}
                <div className="dark:border-dark-400 dark:bg-dark-700 mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="dark:bg-dark-500 flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:text-gray-200">
                    <Squares2X2Icon className="size-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                      {group?.categoryName || "Main Group"}
                    </p>

                    <p className="font-bold text-gray-900 dark:text-white">
                      {group?.groupName}
                    </p>
                  </div>

                  <span className="dark:bg-dark-500 ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    Main Group
                  </span>
                </div>
                {tree.map((n) => (
                  <ListNode
                    key={n.row.id}
                    node={n}
                    depth={0}
                    isOpen={isNodeOpen}
                    toggle={toggle}
                  />
                ))}
              </div>
            )}

            {loading && (
              <p className="dark:text-dark-200 mt-6 text-center text-sm text-gray-500">
                Loading sub groups...
              </p>
            )}
            {!loading && tree.length === 0 && (
              <p className="dark:text-dark-200 mt-6 text-center text-sm text-gray-500">
                No sub groups found in this group.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="dark:border-dark-500 flex justify-end border-t border-gray-200 px-4 py-4 sm:px-5">
            <Button onClick={close}>Close</Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
