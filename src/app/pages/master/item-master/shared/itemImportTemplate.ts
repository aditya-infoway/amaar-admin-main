import ExcelJS from "exceljs";

interface TemplateCategory {
  name: string;
  codeType: "auto" | "manual";
  groups: string[]; // groups and sub groups
}
interface TemplateLists {
  categories: TemplateCategory[];
  locations: string[];
  units: string[];
  taxSlabs: string[];
}

const COLUMNS = [
  { header: "Item Category", width: 22 },
  { header: "Group", width: 28 },
  { header: "Item Code", width: 16 },
  { header: "Item Name", width: 26 },
  { header: "Short Name", width: 16 },
  { header: "HSN Code", width: 14 },
  { header: "Item Location", width: 20 },
  { header: "Unit / UOM", width: 14 },
  { header: "Thickness (mm)", width: 16 },
  { header: "Length (mm)", width: 14 },
  { header: "Width (mm)", width: 14 },
  { header: "Weight (kg)", width: 14 },
  { header: "Tax Slab", width: 14 },
  { header: "Stock Mapping", width: 16 },
  { header: "Min Qty", width: 12 },
  { header: "Max Qty", width: 12 },
  { header: "Opening Stock", width: 15 },
  { header: "Stock Value", width: 14 },
  { header: "Generate Barcode", width: 20 },
];

// used when the caller does not pass units / tax slabs
const DEFAULT_UNITS = ["PCS", "KG", "LTR", "BOX", "SET", "MTR", "ROLL", "BAG"];
const DEFAULT_TAX_SLABS = ["0%", "5%", "12%", "18%", "28%"];

const colName = (n: number): string => {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const colLetter = (header: string) =>
  colName(COLUMNS.findIndex((c) => c.header === header) + 1);

export const downloadItemImportTemplate = async (
  lists: TemplateLists = {
    categories: [],
    locations: [],
    units: [],
    taxSlabs: [],
  },
) => {
  const units = lists.units?.length ? lists.units : DEFAULT_UNITS;
  const taxSlabs = lists.taxSlabs?.length ? lists.taxSlabs : DEFAULT_TAX_SLABS;
  const locations = lists.locations ?? [];
  const categories = lists.categories ?? [];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Items");

  ws.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }));
  ws.getRow(1).font = { bold: true };

  // sample row built from the first real category/group
  const firstCat = categories[0];
  ws.addRow([
    firstCat?.name ?? "",
    firstCat?.groups[0] ?? "",
    firstCat?.codeType === "auto" ? "" : "",
    "Sample Item",
    "Sample",
    "8708",
    locations[0] ?? "",
    units[0] ?? "",
    10,
    100,
    50,
    2.5,
    taxSlabs[0] ?? "",
    "Yes",
    5,
    50,
    20,
    4000,
    "Yes",
  ]);

  // hidden sheet that feeds the dropdowns
  const listWs = wb.addWorksheet("Lists", { state: "hidden" });
  const putList = (col: number, title: string, values: string[]) => {
    listWs.getCell(1, col).value = title;
    values.forEach((v, i) => (listWs.getCell(i + 2, col).value = v));
  };
  putList(1, "Locations", locations);
  putList(2, "Units", units);
  putList(3, "TaxSlabs", taxSlabs);
  putList(
    4,
    "Categories",
    categories.map((c) => c.name),
  );
  putList(
    5,
    "CodeTypes",
    categories.map((c) => c.codeType),
  ); // same order as Categories

  // Groups: one column per category (from F), header = category name
  const GROUP_START = 6;
  categories.forEach((c, i) => putList(GROUP_START + i, c.name, c.groups));
  const groupLast = colName(GROUP_START + Math.max(categories.length, 1) - 1);
  const groupStartL = colName(GROUP_START);

  const addDropdown = (header: string, formula: string) => {
    const L = colLetter(header);
    for (let r = 2; r <= 1000; r++) {
      ws.getCell(`${L}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: "Invalid value",
        error: "Please pick a value from the list",
      };
    }
  };

  if (categories.length) {
    const n = categories.length + 1;
    addDropdown("Item Category", `Lists!$D$2:$D$${n}`);

    const catL = colLetter("Item Category");
    const grpL = colLetter("Group");
    const codeL = colLetter("Item Code");

    for (let r = 2; r <= 1000; r++) {
      // Group: groups and sub groups of the selected category
      const m = `MATCH($${catL}${r},Lists!$${groupStartL}$1:$${groupLast}$1,0)-1`;
      const formula = `OFFSET(Lists!$${groupStartL}$1,1,${m},MAX(1,COUNTA(OFFSET(Lists!$${groupStartL}$1,1,${m},200,1))),1)`;
      ws.getCell(`${grpL}${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorTitle: "Invalid group",
        error:
          "Select an Item Category first, then pick a Group or Sub Group from its list.",
      };

      // Item Code: typing allowed only for manual categories
      const isManual = `IFERROR(INDEX(Lists!$E$2:$E$${n},MATCH($${catL}${r},Lists!$D$2:$D$${n},0))="manual",TRUE)`;
      ws.getCell(`${codeL}${r}`).dataValidation = {
        type: "custom",
        allowBlank: true,
        formulae: [isManual],
        showInputMessage: true,
        promptTitle: "Item Code",
        prompt:
          "Manual category: enter the code. Auto category (grey cell): leave blank, the system generates it on import.",
        showErrorMessage: true,
        errorStyle: "stop",
        errorTitle: "Auto item code",
        error:
          "This category uses an auto item code. Leave Item Code blank, the system will generate it on import.",
      };
    }

    // grey out Item Code cells of auto categories
    ws.addConditionalFormatting({
      ref: `${codeL}2:${codeL}1000`,
      rules: [
        {
          type: "expression",
          priority: 1,
          formulae: [
            `IFERROR(INDEX(Lists!$E$2:$E$${n},MATCH($${catL}2,Lists!$D$2:$D$${n},0))="auto",FALSE)`,
          ],
          style: {
            font: { color: { argb: "FF9CA3AF" } },
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "FFE5E7EB" },
            },
          },
        },
      ],
    });
  }

  if (locations.length)
    addDropdown("Item Location", `Lists!$A$2:$A$${locations.length + 1}`);
  addDropdown("Unit / UOM", `Lists!$B$2:$B$${units.length + 1}`);
  addDropdown("Tax Slab", `Lists!$C$2:$C$${taxSlabs.length + 1}`);
  addDropdown("Stock Mapping", '"Yes,No"');
  addDropdown("Generate Barcode", '"Yes,No"');

  const info = wb.addWorksheet("Instructions");
  info.columns = [{ width: 110 }];
  [
    "Required: Item Name, Item Category, Group, Item Location, Unit / UOM, Tax Slab.",
    "Select the Item Category first, then pick a Group or Sub Group from the Group dropdown.",
    "Item Code: for a category with a Manual code, enter the Item Code yourself (required). For a category with an Auto code (grey cell), leave Item Code blank, the system generates the next code on import.",
    "Item Location, Unit / UOM and Tax Slab: pick from the dropdown.",
    "Stock Mapping = Yes: Min Qty and Max Qty are saved. Stock Mapping = No: they are ignored.",
    "Generate Barcode = Yes: the system creates the barcode. No or blank: barcode stays empty.",
  ].forEach((t) => info.addRow([t]));

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "item-master-import-template.xlsx";
  a.click();
  URL.revokeObjectURL(url);
};