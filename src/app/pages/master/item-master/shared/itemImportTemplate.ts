import ExcelJS from "exceljs";

interface TemplateLists {
  locations: string[];
  units: string[];
  taxSlabs: string[];
}

const COLUMNS = [
  { header: "Item Code", width: 16 },
  { header: "Item Name", width: 26 },
  { header: "Short Name", width: 16 },
  { header: "HSN Code", width: 14 },
  { header: "Item Location", width: 20 },
  { header: "Item Category", width: 22 },
  { header: "Group", width: 16 },
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

const colLetter = (header: string) =>
  String.fromCharCode(65 + COLUMNS.findIndex((c) => c.header === header));

export const downloadItemImportTemplate = async (
  lists: TemplateLists = { locations: [], units: [], taxSlabs: [] },
) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Items");

  ws.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }));
  ws.getRow(1).font = { bold: true };

  ws.addRow([
    "ITEM001",
    "Sample Item",
    "Sample",
    "8708",
    "Main Store",
    "Finished Goods",
    "TD",
    "PCS",
    10,
    100,
    50,
    2.5,
    "5%",
    "Yes",
    5,
    50,
    20,
    4000,
    "Yes",
  ]);
  ws.addRow([
    "ITEM002",
    "Another Item",
    "Another",
    "8708",
    "Main Store",
    "Tyre",
    "T1",
    "PCS",
    "",
    "",
    "",
    "",
    "5%",
    "No",
    "",
    "",
    0,
    0,
    "No",
  ]);

  // hidden sheet that feeds the dropdowns
  const listWs = wb.addWorksheet("Lists", { state: "hidden" });
  const putList = (col: number, title: string, values: string[]) => {
    listWs.getCell(1, col).value = title;
    values.forEach((v, i) => (listWs.getCell(i + 2, col).value = v));
  };
  putList(1, "Locations", lists.locations);
  putList(2, "Units", lists.units);
  putList(3, "TaxSlabs", lists.taxSlabs);

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

  if (lists.locations.length)
    addDropdown("Item Location", `Lists!$A$2:$A$${lists.locations.length + 1}`);
  if (lists.units.length)
    addDropdown("Unit / UOM", `Lists!$B$2:$B$${lists.units.length + 1}`);
  if (lists.taxSlabs.length)
    addDropdown("Tax Slab", `Lists!$C$2:$C$${lists.taxSlabs.length + 1}`);
  addDropdown("Stock Mapping", '"Yes,No"');
  addDropdown("Generate Barcode", '"Yes,No"');

  const info = wb.addWorksheet("Instructions");
  info.columns = [{ width: 110 }];
  [
    "Required: Item Code, Item Name, Item Category, Group.",
    "Item Category and Group must match existing names exactly.",
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
