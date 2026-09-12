export type IndentItem = {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  hsnCode: string;
  tax: number | string;
  requiredQty: number;
};

export type Indent = {
  id: string;
  indentNo?: string | number;
  workOrderId?: string | number;
  workOrderNo?: string;
  modelName?: string;
  date?: string;
  items?: IndentItem[];
};