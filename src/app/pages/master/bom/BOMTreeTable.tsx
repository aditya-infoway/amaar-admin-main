// src/pages/master/bom/BOMTreeTable.tsx
import { useState } from "react";
import { ChevronDown, ChevronRight, Package, Box } from "lucide-react";
import { BOMTreeNode } from "./bomTree";

function TreeRow({ node, level }: { node: BOMTreeNode; level: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="grid grid-cols-[1fr_1fr_80px] items-center border-b border-gray-100 py-1.5 hover:bg-gray-50"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-1.5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[14px]" />
          )}
          {hasChildren ? (
            <Package size={14} className="text-amber-500" />
          ) : (
            <Box size={14} className="text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-700">{node.itemCode}</span>
        </div>
        <span className="text-sm text-gray-500">{node.itemName}</span>
        <span className="text-sm text-gray-500">{node.qty}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child, index) => (
            <TreeRow key={`${node.itemCode}-child-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BOMTreeTable({ nodes }: { nodes: BOMTreeNode[] }) {
  if (nodes.length === 0) {
    return <p className="text-sm text-gray-400">No components added yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="grid grid-cols-[1fr_1fr_80px] bg-gray-50 px-2 py-2 text-xs font-semibold uppercase text-gray-500">
        <span>Item Code</span>
        <span>Item Name</span>
        <span>Qty</span>
      </div>
      <div className="px-2">
        {nodes.map((node, index) => (
          <TreeRow key={`root-${node.itemCode}-${index}`} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}