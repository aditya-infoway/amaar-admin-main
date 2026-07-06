import { useState, Fragment, useMemo } from 'react';
import {
  PlusIcon, PencilSquareIcon, CheckIcon, EllipsisVerticalIcon, CalendarIcon,
  MagnifyingGlassIcon, ArrowsUpDownIcon, FunnelIcon, ArrowPathIcon,
  ArrowDownTrayIcon, PrinterIcon, Cog6ToothIcon, ChevronDownIcon, ChevronRightIcon,
  FolderIcon, DocumentTextIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import {
  Tab, TabGroup, TabList, TabPanel, TabPanels,
  Menu, MenuButton, MenuItem, MenuItems, Transition
} from "@headlessui/react";
import clsx from "clsx";
import { Input, Checkbox, Button, Radio } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { FaLayerGroup } from 'react-icons/fa';
import KYCForm from '../steps';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TreeNode {
  id: string;
  label: string;
  code: string;
  level: number;
  children?: TreeNode[];
}

interface TableRow {
  id: string;
  indent: number;
  code: string;
  name: string;
  type: string;
  spec: string;
  uom: string;
  qty: string;
  wastage: string;
  netQty: string;
  rate: string;
  amount: string;
  isHeader: boolean;
}

interface FilterState {
  search: string;
  type: string[];
  uom: string[];
  wastageMin: string;
  wastageMax: string;
  levelFilter: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const initialTreeData: TreeNode[] = [
  {
    id: '0', label: 'SIDE WALL ASSEMBLY', code: 'SW-ASM-001', level: 0,
    children: [
      {
        id: '1', label: 'TOP CHANNEL', code: 'TC-001', level: 1,
        children: [
          { id: '1.1', label: 'CHANNEL 100X50', code: 'CH-100X50', level: 2 },
          { id: '1.2', label: 'FLAT PLATE 6MM', code: 'FP-06', level: 2 },
        ],
      },
      {
        id: '2', label: 'MIDDLE PILLAR', code: 'MP-001', level: 1,
        children: [
          { id: '2.1', label: 'CHANNEL 80X40', code: 'CH-80X40', level: 2 },
          { id: '2.2', label: 'FLAT PLATE 5MM', code: 'FP-05', level: 2 },
        ],
      },
      { id: '3', label: 'BOTTOM CHANNEL', code: 'BC-001', level: 1 },
      { id: '4', label: 'RIVET 6MM', code: 'RV-06', level: 1 },
      { id: '5', label: 'PAINT', code: 'PT-001', level: 1 },
    ],
  },
];

const allTableData: Record<string, TableRow[]> = {
  '0': [
    { id: '1', indent: 0, code: 'TC-001', name: 'TOP CHANNEL', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '1.000', wastage: '0.00', netQty: '1.000', rate: '1,450.00', amount: '1,450.00', isHeader: true },
    { id: '1.1', indent: 1, code: 'CH-100X50', name: 'CHANNEL 100X50', type: 'Raw Material', spec: '100X50X5', uom: 'MTR', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '95.00', amount: '242.25', isHeader: false },
    { id: '1.2', indent: 1, code: 'FP-06', name: 'FLAT PLATE 6MM', type: 'Raw Material', spec: 'PL 6MM', uom: 'KG', qty: '3.200', wastage: '2.00', netQty: '3.264', rate: '78.00', amount: '244.59', isHeader: false },
    { id: '2', indent: 0, code: 'MP-001', name: 'MIDDLE PILLAR', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '2.000', wastage: '0.00', netQty: '2.000', rate: '1,250.00', amount: '2,500.00', isHeader: true },
    { id: '2.1', indent: 1, code: 'CH-80X40', name: 'CHANNEL 80X40', type: 'Raw Material', spec: '80X40X4', uom: 'MTR', qty: '1.800', wastage: '2.00', netQty: '1.836', rate: '78.00', amount: '143.21', isHeader: false },
    { id: '2.2', indent: 1, code: 'FP-05', name: 'FLAT PLATE 5MM', type: 'Raw Material', spec: 'PL 5MM', uom: 'KG', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '72.00', amount: '183.60', isHeader: false },
    { id: '3', indent: 0, code: 'BC-001', name: 'BOTTOM CHANNEL', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '1.000', wastage: '0.00', netQty: '1.000', rate: '1,150.00', amount: '1,150.00', isHeader: true },
    { id: '4', indent: 0, code: 'RV-06', name: 'RIVET 6MM', type: 'Raw Material', spec: '6X20', uom: 'NOS', qty: '48.000', wastage: '0.00', netQty: '48.000', rate: '1.20', amount: '57.60', isHeader: false },
    { id: '5', indent: 0, code: 'PT-001', name: 'PAINT', type: 'Raw Material', spec: 'ENAMEL', uom: 'LTR', qty: '1.200', wastage: '0.00', netQty: '1.200', rate: '250.00', amount: '300.00', isHeader: false },
  ],
  '1': [
    { id: '1', indent: 0, code: 'TC-001', name: 'TOP CHANNEL', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '1.000', wastage: '0.00', netQty: '1.000', rate: '1,450.00', amount: '1,450.00', isHeader: true },
    { id: '1.1', indent: 1, code: 'CH-100X50', name: 'CHANNEL 100X50', type: 'Raw Material', spec: '100X50X5', uom: 'MTR', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '95.00', amount: '242.25', isHeader: false },
    { id: '1.2', indent: 1, code: 'FP-06', name: 'FLAT PLATE 6MM', type: 'Raw Material', spec: 'PL 6MM', uom: 'KG', qty: '3.200', wastage: '2.00', netQty: '3.264', rate: '78.00', amount: '244.59', isHeader: false },
  ],
  '1.1': [{ id: '1.1', indent: 0, code: 'CH-100X50', name: 'CHANNEL 100X50', type: 'Raw Material', spec: '100X50X5', uom: 'MTR', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '95.00', amount: '242.25', isHeader: false }],
  '1.2': [{ id: '1.2', indent: 0, code: 'FP-06', name: 'FLAT PLATE 6MM', type: 'Raw Material', spec: 'PL 6MM', uom: 'KG', qty: '3.200', wastage: '2.00', netQty: '3.264', rate: '78.00', amount: '244.59', isHeader: false }],
  '2': [
    { id: '2', indent: 0, code: 'MP-001', name: 'MIDDLE PILLAR', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '2.000', wastage: '0.00', netQty: '2.000', rate: '1,250.00', amount: '2,500.00', isHeader: true },
    { id: '2.1', indent: 1, code: 'CH-80X40', name: 'CHANNEL 80X40', type: 'Raw Material', spec: '80X40X4', uom: 'MTR', qty: '1.800', wastage: '2.00', netQty: '1.836', rate: '78.00', amount: '143.21', isHeader: false },
    { id: '2.2', indent: 1, code: 'FP-05', name: 'FLAT PLATE 5MM', type: 'Raw Material', spec: 'PL 5MM', uom: 'KG', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '72.00', amount: '183.60', isHeader: false },
  ],
  '2.1': [{ id: '2.1', indent: 0, code: 'CH-80X40', name: 'CHANNEL 80X40', type: 'Raw Material', spec: '80X40X4', uom: 'MTR', qty: '1.800', wastage: '2.00', netQty: '1.836', rate: '78.00', amount: '143.21', isHeader: false }],
  '2.2': [{ id: '2.2', indent: 0, code: 'FP-05', name: 'FLAT PLATE 5MM', type: 'Raw Material', spec: 'PL 5MM', uom: 'KG', qty: '2.500', wastage: '2.00', netQty: '2.550', rate: '72.00', amount: '183.60', isHeader: false }],
  '3': [{ id: '3', indent: 0, code: 'BC-001', name: 'BOTTOM CHANNEL', type: 'Sub Assembly', spec: '-', uom: 'NOS', qty: '1.000', wastage: '0.00', netQty: '1.000', rate: '1,150.00', amount: '1,150.00', isHeader: true }],
  '4': [{ id: '4', indent: 0, code: 'RV-06', name: 'RIVET 6MM', type: 'Raw Material', spec: '6X20', uom: 'NOS', qty: '48.000', wastage: '0.00', netQty: '48.000', rate: '1.20', amount: '57.60', isHeader: false }],
  '5': [{ id: '5', indent: 0, code: 'PT-001', name: 'PAINT', type: 'Raw Material', spec: 'ENAMEL', uom: 'LTR', qty: '1.200', wastage: '0.00', netQty: '1.200', rate: '250.00', amount: '300.00', isHeader: false }],
};

const summaryByNode: Record<string, { rawMaterials: number; subAssemblies: number; operations: number; totalCost: string; totalWeight: string }> = {
  '0': { rawMaterials: 24, subAssemblies: 6, operations: 8, totalCost: '₹ 18,745.60', totalWeight: '256.480 KG' },
  '1': { rawMaterials: 2, subAssemblies: 1, operations: 2, totalCost: '₹ 1,486.84', totalWeight: '42.600 KG' },
  '1.1': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 242.25', totalWeight: '12.750 KG' },
  '1.2': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 244.59', totalWeight: '16.320 KG' },
  '2': { rawMaterials: 2, subAssemblies: 1, operations: 2, totalCost: '₹ 2,826.81', totalWeight: '38.220 KG' },
  '2.1': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 143.21', totalWeight: '9.180 KG' },
  '2.2': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 183.60', totalWeight: '12.750 KG' },
  '3': { rawMaterials: 0, subAssemblies: 1, operations: 1, totalCost: '₹ 1,150.00', totalWeight: '68.400 KG' },
  '4': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 57.60', totalWeight: '0.480 KG' },
  '5': { rawMaterials: 1, subAssemblies: 0, operations: 0, totalCost: '₹ 300.00', totalWeight: '1.200 KG' },
};

const TABS = ['BOM STRUCTURE', 'BOM DETAILS', 'ROUTING', 'COSTING', 'ATTACHMENTS', 'NOTES', 'HISTORY'];
const TYPE_OPTIONS = ['Sub Assembly', 'Raw Material', 'Purchased Part', 'Semi-Finished'];
const UOM_OPTIONS = ['NOS', 'MTR', 'KG', 'LTR', 'SET', 'PCE'];
const LEVEL_OPTIONS = ['All Levels', 'Level 0', 'Level 1', 'Level 2'];

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  onReset: () => void;
}

function FilterPanel({ filters, onChange, onClose, onReset }: FilterPanelProps) {
  const toggleArr = (field: 'type' | 'uom', val: string) => {
    const arr = filters[field];
    onChange({ ...filters, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4" style={{ animation: 'slideDown 0.15s ease' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-900">Filter Options</span>
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="text-xs font-medium text-primary-600 hover:text-primary-700 transition">
            Reset All
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 transition">
            <XMarkIcon className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Item Type */}
        <div>
          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2.5">Item Type</p>
          <div className="space-y-2">
            {TYPE_OPTIONS.map(t => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={filters.type.includes(t)} onChange={() => toggleArr('type', t)} />
                <span className="text-sm text-slate-800">{t}</span>
              </label>
            ))}
          </div>
        </div>
        {/* UOM */}
        <div>
          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2.5">Unit of Measure</p>
          <div className="space-y-2">
            {UOM_OPTIONS.map(u => (
              <label key={u} className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox checked={filters.uom.includes(u)} onChange={() => toggleArr('uom', u)} />
                <span className="text-sm text-slate-800">{u}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Wastage */}
        <div>
          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2.5">Wastage % Range</p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              placeholder="Min"
              value={filters.wastageMin}
              onChange={e => onChange({ ...filters, wastageMin: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            />
            <span className="text-slate-400 text-xs shrink-0">–</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.wastageMax}
              onChange={e => onChange({ ...filters, wastageMax: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            />
          </div>
        </div>
        {/* Level */}
        <div>
          <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2.5">BOM Level</p>
          <div className="space-y-2">
            {LEVEL_OPTIONS.map(l => (
              <label key={l} className="flex items-center gap-2.5 cursor-pointer">
                <Radio
                  name="bom-level"
                  checked={filters.levelFilter === l}
                  onChange={() => onChange({ ...filters, levelFilter: l })}
                />
                <span className="text-sm text-slate-800">{l}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Active Filter Tags ───────────────────────────────────────────────────────

function ActiveFilterTags({ filters, onChange }: { filters: FilterState; onChange: (f: FilterState) => void }) {
  const tags: { label: string; remove: () => void }[] = [];
  filters.type.forEach(t => tags.push({ label: `Type: ${t}`, remove: () => onChange({ ...filters, type: filters.type.filter(x => x !== t) }) }));
  filters.uom.forEach(u => tags.push({ label: `UOM: ${u}`, remove: () => onChange({ ...filters, uom: filters.uom.filter(x => x !== u) }) }));
  if (filters.wastageMin) tags.push({ label: `Wastage ≥ ${filters.wastageMin}%`, remove: () => onChange({ ...filters, wastageMin: '' }) });
  if (filters.wastageMax) tags.push({ label: `Wastage ≤ ${filters.wastageMax}%`, remove: () => onChange({ ...filters, wastageMax: '' }) });
  if (filters.levelFilter && filters.levelFilter !== 'All Levels')
    tags.push({ label: filters.levelFilter, remove: () => onChange({ ...filters, levelFilter: 'All Levels' }) });
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white">
      <span className="text-xs text-slate-500 mr-1">Active filters:</span>
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
          {tag.label}
          <button onClick={tag.remove} className="hover:text-primary-900 transition ml-0.5">
            <XMarkIcon className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Tree Node ────────────────────────────────────────────────────────────────

function TreeNodeItem({
  node, expandedNodes, selectedNodeId, onToggle, onSelect,
}: {
  node: TreeNode;
  expandedNodes: Record<string, boolean>;
  selectedNodeId: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isExpanded = !!expandedNodes[node.id];
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="select-none">
      <div
        onClick={() => { onSelect(node.id); if (hasChildren) onToggle(node.id); }}
        style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        className={clsx(
          'flex items-center justify-between py-2 pr-2 rounded-lg cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary-50 border border-primary-200'
            : node.level === 0
              ? 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
              : 'border border-transparent hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Expand arrow */}
          <span className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-400">
            {hasChildren
              ? isExpanded
                ? <ChevronDownIcon className={clsx('w-3.5 h-3.5', isSelected ? 'text-primary-600' : 'text-slate-500')} />
                : <ChevronRightIcon className={clsx('w-3.5 h-3.5', isSelected ? 'text-primary-600' : 'text-slate-500')} />
              : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block" />
            }
          </span>
          {/* Icon */}
          <span className={clsx('shrink-0', isSelected ? 'text-primary-600' : 'text-primary-500')}>
            {node.level === 0
              ? <FaLayerGroup className="w-3.5 h-3.5" />
              : hasChildren
                ? <FolderIcon className="w-3.5 h-3.5" />
                : <DocumentTextIcon className="w-3.5 h-3.5" />
            }
          </span>
          {/* Label + Code */}
          <div className="min-w-0">
            <p className={clsx('text-xs font-semibold uppercase truncate', isSelected ? 'text-primary-800' : 'text-slate-900')}>
              {node.label}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{node.code}</p>
          </div>
        </div>
        {/* Level badge */}
        <span className={clsx(
          'text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-2 border',
          node.level === 0
            ? 'bg-primary-50 text-primary-700 border-primary-200'
            : node.level === 1
              ? 'bg-primary-50 text-primary-600 border-primary-100'
              : 'bg-slate-50 text-slate-600 border-slate-200'
        )}>
          Level {node.level}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5 relative before:absolute before:left-[20px] before:top-0 before:bottom-2 before:w-px before:bg-slate-200">
          {node.children!.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar Icon Button ──────────────────────────────────────────────────────

function IconBtn({ icon: Icon, title, onClick }: { icon: React.FC<React.SVGProps<SVGSVGElement>>; title?: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillOfMaterials() {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ '0': true, '1': true, '2': true });
  const [selectedNodeId, setSelectedNodeId] = useState('0');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '', type: [], uom: [], wastageMin: '', wastageMax: '', levelFilter: 'All Levels',
  });

  const toggleNode = (id: string) => setExpandedNodes(p => ({ ...p, [id]: !p[id] }));
  const expandAll = () => setExpandedNodes({ '0': true, '1': true, '2': true });
  const collapseAll = () => setExpandedNodes({});
  const resetFilters = () => setFilters({ search: '', type: [], uom: [], wastageMin: '', wastageMax: '', levelFilter: 'All Levels' });

  const activeFilterCount = useMemo(() => {
    let n = filters.type.length + filters.uom.length;
    if (filters.wastageMin) n++;
    if (filters.wastageMax) n++;
    if (filters.levelFilter && filters.levelFilter !== 'All Levels') n++;
    return n;
  }, [filters]);

  const baseRows = allTableData[selectedNodeId] ?? allTableData['0'];

  const displayRows = useMemo(() => baseRows.filter(row => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!row.name.toLowerCase().includes(q) && !row.code.toLowerCase().includes(q)) return false;
    }
    if (filters.type.length && !filters.type.includes(row.type)) return false;
    if (filters.uom.length && !filters.uom.includes(row.uom)) return false;
    const w = parseFloat(row.wastage);
    if (filters.wastageMin && w < parseFloat(filters.wastageMin)) return false;
    if (filters.wastageMax && w > parseFloat(filters.wastageMax)) return false;
    if (filters.levelFilter && filters.levelFilter !== 'All Levels') {
      const lvl = parseInt(filters.levelFilter.replace('Level ', ''));
      if (row.indent !== lvl) return false;
    }
    return true;
  }), [baseRows, filters]);

  const summary = summaryByNode[selectedNodeId] ?? summaryByNode['0'];

  const totalQty = displayRows.reduce((a, r) => a + parseFloat(r.netQty.replace(/,/g, '')), 0).toFixed(3);
  const totalAmount = displayRows.reduce((a, r) => a + parseFloat(r.amount.replace(/,/g, '')), 0);
  const fmtAmount = '₹ ' + totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  function flattenTree(nodes: TreeNode[]): { node: TreeNode; depth: number }[] {
    const out: { node: TreeNode; depth: number }[] = [];
    const walk = (arr: TreeNode[], d: number) => arr.forEach(n => { out.push({ node: n, depth: d }); if (n.children) walk(n.children, d + 1); });
    walk(nodes, 0);
    return out;
  }
  const flatNodes = flattenTree(initialTreeData);

  // Header form fields
  const headerFields = [
    { label: 'BOM No.', placeholder: 'BOM-2025-001' },
    { label: 'Item Name', placeholder: 'Side Wall Assembly' },
    { label: 'Revision No.', placeholder: 'Rev 01' },
    { label: 'Prepared By', placeholder: 'John Doe' },
    { label: 'Description', placeholder: 'Main side wall panel' },
    { label: 'Item Code', placeholder: 'SW-ASM-001' },
    { label: 'UOM', placeholder: 'NOS' },
    { label: 'Approved By', placeholder: 'Jane Smith' },
    { label: 'BOM Type', placeholder: 'Manufacturing' },
  ];

  const TABLE_COLS = ['#', 'Item Code', 'Item Name', 'Type', 'Specification', 'UOM', 'Quantity', 'Wastage %', 'Net Qty', 'Rate (₹)', 'Amount (₹)'];
  const RIGHT_ALIGN = new Set(['Quantity', 'Wastage %', 'Net Qty', 'Rate (₹)', 'Amount (₹)']);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 font-sans text-slate-900 antialiased">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* ── BOM Header + Summary ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">

          {/* Header Card */}
          <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
            {/* Card title + actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h1 className="text-base font-semibold text-slate-900">BOM HEADER</h1>
                <p className="text-xs text-slate-500 mt-0.5">Manage and structure your bill of materials</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button color="primary" className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg shadow-sm">
                  <PlusIcon className="w-4 h-4" /> New BOM
                </Button>
                <Button color="warning" className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg">
                  <PencilSquareIcon className="w-4 h-4" /> Revision
                </Button>
                <Button color="success" className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg">
                  <CheckIcon className="w-4 h-4" /> Approve
                </Button>
                {/* More menu */}
                {[EllipsisVerticalIcon].map((Icon, i) => (
                  <Menu key={i} as="div" className="relative">
                    <MenuButton className="size-9 flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition">
                      <Icon className="w-4 h-4" />
                    </MenuButton>
                    <Transition as={Fragment}
                      enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg outline-none">
                        {['Export Excel', 'Export PDF', 'Print Preview'].map(a => (
                          <MenuItem key={a}>
                            {({ focus }) => (
                              <button className={clsx('flex h-9 w-full items-center px-4 text-sm transition-colors', focus ? 'bg-slate-50 text-slate-900' : 'text-slate-700')}>
                                {a}
                              </button>
                            )}
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Transition>
                  </Menu>
                ))}
              </div>
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {headerFields.map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">{f.label}</label>
                  <Input placeholder={f.placeholder} value="" />
                </div>
              ))}
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5">Status</label>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active
                  </span>
                </div>
              </div>
              {/* Dates */}
              {['Effective From', 'Effective To'].map(label => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-900 mb-1.5">{label}</label>
                  <div className="relative">
                    <DatePicker placeholder="Choose date..." />
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
              <h2 className="text-sm font-semibold text-slate-900">BOM SUMMARY</h2>
              {selectedNodeId !== '0' && (
                <span className="text-xs font-medium text-primary-600 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                  {allTableData[selectedNodeId]?.[0]?.code}
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {[
                { label: 'Total Raw Materials', value: summary.rawMaterials },
                { label: 'Sub Assemblies', value: summary.subAssemblies },
                { label: 'Operations', value: summary.operations },
                { label: 'Total Cost', value: summary.totalCost },
                { label: 'Total Weight', value: summary.totalWeight },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Section ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden">
          <TabGroup>
            {/* Tab list */}
            <div className="border-b border-slate-200 bg-white">
              <TabList className="flex overflow-x-auto">
                {TABS.map(tab => (
                  <Tab
                    key={tab}
                    className={({ selected }) => clsx(
                      'shrink-0 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-all duration-150 focus:outline-none',
                      selected
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                    )}
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: view toggle + search */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {(['tree', 'list'] as const).map((mode, i) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={clsx(
                        'px-3.5 py-2 text-sm font-medium transition flex items-center gap-1.5',
                        i === 0 ? 'border-r border-slate-200' : '',
                        viewMode === mode ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {mode === 'tree' ? '⊞ Tree View' : '☰ List View'}
                    </button>
                  ))}
                </div>
                <div className="relative w-52 sm:w-72">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Item..."
                    value={filters.search}
                    onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={expandAll}
                  className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  <PlusIcon className="w-3.5 h-3.5 text-slate-500" /> Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  <ArrowsUpDownIcon className="w-3.5 h-3.5 text-slate-500" /> Collapse All
                </button>
                <div className="h-5 w-px bg-slate-200 mx-0.5 hidden md:block" />
                <button
                  onClick={() => setShowFilter(p => !p)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 border px-3 py-2 rounded-lg text-sm font-medium transition relative',
                    showFilter
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  )}
                >
                  <FunnelIcon className="w-3.5 h-3.5" /> Filter
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-semibold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <IconBtn icon={ArrowPathIcon} title="Refresh" onClick={resetFilters} />
                <IconBtn icon={ArrowDownTrayIcon} title="Download" />
                <IconBtn icon={PrinterIcon} title="Print" />
                <IconBtn icon={Cog6ToothIcon} title="Settings" />
              </div>
            </div>

            {/* Filter panel */}
            {showFilter && (
              <FilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilter(false)} onReset={resetFilters} />
            )}

            {/* Active filter chips */}
            <ActiveFilterTags filters={filters} onChange={setFilters} />

            {/* Tab Panels */}
            <TabPanels>
              {TABS.map(tab => (
                <TabPanel key={tab} className="focus:outline-none p-4">
                  {viewMode === 'tree' ? (
                    /* Tree + Table layout */
                    <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[480px]">

                      {/* Left: Tree */}
                      <div className="p-2 overflow-y-auto max-h-[620px] space-y-0.5">
                        {initialTreeData.map(node => (
                          <TreeNodeItem
                            key={node.id}
                            node={node}
                            expandedNodes={expandedNodes}
                            selectedNodeId={selectedNodeId}
                            onToggle={toggleNode}
                            onSelect={setSelectedNodeId}
                          />
                        ))}
                      </div>

                      {/* Right: Table */}
                      <div className="lg:col-span-3 lg:pl-4 flex flex-col pt-3 lg:pt-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 mb-3 text-xs text-slate-500">
                          <span>SW-ASM-001</span>
                          {selectedNodeId !== '0' && (
                            <>
                              <ChevronRightIcon className="w-3 h-3" />
                              <span className="text-primary-600 font-medium">{allTableData[selectedNodeId]?.[0]?.code}</span>
                            </>
                          )}
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="py-2.5 px-3 w-8">
                                  <Checkbox defaultChecked />
                                </th>
                                {TABLE_COLS.map(col => (
                                  <th
                                    key={col}
                                    className={clsx(
                                      'py-2.5 px-3 text-xs font-semibold text-slate-900 whitespace-nowrap',
                                      RIGHT_ALIGN.has(col) ? 'text-right' : 'text-left'
                                    )}
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {displayRows.length === 0 ? (
                                <tr>
                                  <td colSpan={12} className="py-10 text-center text-sm text-slate-500">
                                    No items match the current filters.
                                  </td>
                                </tr>
                              ) : displayRows.map(row => (
                                <tr
                                  key={row.id}
                                  className={clsx(
                                    'transition-colors hover:bg-slate-50',
                                    row.isHeader ? 'bg-primary-50/40' : ''
                                  )}
                                >
                                  <td className="py-2.5 px-3"><Checkbox defaultChecked /></td>

                                  {/* # */}
                                  <td className="py-2.5 px-3 text-slate-900 text-sm">{row.id}</td>

                                  {/* Item Code */}
                                  <td className={clsx('py-2.5 px-3 text-sm', row.isHeader ? 'text-primary-600 font-medium' : 'text-slate-900')}>
                                    {row.code}
                                  </td>

                                  {/* Item Name — indented */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900">
                                    <div style={{ paddingLeft: `${row.indent * 16}px` }} className="flex items-center gap-1.5">
                                      {row.indent > 0 && <span className="w-3 h-px bg-slate-300 shrink-0 inline-block" />}
                                      <span className={row.isHeader ? 'font-medium' : ''}>{row.name}</span>
                                    </div>
                                  </td>

                                  {/* Type badge */}
                                  <td className="py-2.5 px-3">
                                    <span className={clsx(
                                      'inline-flex px-2 py-0.5 rounded text-xs font-medium border',
                                      row.type === 'Sub Assembly'
                                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    )}>
                                      {row.type}
                                    </span>
                                  </td>

                                  {/* Specification */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900">{row.spec}</td>

                                  {/* UOM */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900">{row.uom}</td>

                                  {/* Quantity */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900 text-right">{row.qty}</td>

                                  {/* Wastage % */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900 text-right">{row.wastage}</td>

                                  {/* Net Qty */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900 text-right">{row.netQty}</td>

                                  {/* Rate */}
                                  <td className="py-2.5 px-3 text-sm text-slate-900 text-right">{row.rate}</td>

                                  {/* Amount */}
                                  <td className={clsx(
                                    'py-2.5 px-3 text-sm text-right',
                                    row.isHeader ? 'text-primary-600 font-medium' : 'text-slate-900'
                                  )}>
                                    {row.amount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer totals */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-sm text-slate-700">
                            Total Items: <span className="font-semibold text-primary-600">{displayRows.length}</span>
                          </span>
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-slate-700">
                              Total Qty: <span className="font-semibold text-slate-900 ml-1">{totalQty}</span>
                            </div>
                            <div className="text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-4 py-2 rounded-lg">
                              Total Amount: <span className="ml-1">{fmtAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  ) : (
                    /* List View */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="py-2.5 px-3 w-8"><Checkbox defaultChecked /></th>
                            {['Code', 'Label', 'Level', 'Has Children'].map(col => (
                              <th key={col} className="py-2.5 px-4 text-xs font-semibold text-slate-900">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {flatNodes.map(({ node, depth }) => (
                            <tr
                              key={node.id}
                              onClick={() => setSelectedNodeId(node.id)}
                              className={clsx(
                                'cursor-pointer hover:bg-slate-50 transition-colors',
                                selectedNodeId === node.id ? 'bg-primary-50/40 border-l-2 border-l-primary-500' : ''
                              )}
                            >
                              <td className="py-2.5 px-3"><Checkbox /></td>
                              <td className="py-2.5 px-4 text-primary-600 font-medium text-sm">{node.code}</td>
                              <td className="py-2.5 px-4 text-sm text-slate-900">
                                <div style={{ paddingLeft: `${depth * 16}px` }}>{node.label}</div>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={clsx(
                                  'inline-flex px-2 py-0.5 rounded text-xs font-medium border',
                                  node.level === 0
                                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                                    : node.level === 1
                                      ? 'bg-primary-50 text-primary-600 border-primary-100'
                                      : 'bg-slate-50 text-slate-700 border-slate-200'
                                )}>
                                  Level {node.level}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-sm text-slate-900">
                                {node.children?.length ? `Yes (${node.children.length})` : 'No'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
        <KYCForm />
      </div>
    </div>
  );
}