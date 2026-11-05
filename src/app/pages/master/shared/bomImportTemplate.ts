import * as XLSX from "xlsx";

export function downloadBomImportTemplate() {
  const headers = [
    "Parent",
    "Item",
    "S. No.",
    "Child",
    "Child Name",
    "UOM",
    "QPV",
    "L",
    "W",
    "T",
  ];

  const blank: any[] = []; // group ke beech ki khali line

  const sampleRows: any[][] = [
    // ---- Group 1: Root parent ----
    ["592007260100", "26 CBM TIPPER BODY ASSY ON TATA SIGNA 3530.TK", 1, "592007260101", "26 CBM TIPPER BODY ASSY ON TATA SIGNA 3530.TK", "NO", 1, "", "", ""],
    blank,

    // ---- Group 2: 592007260101 ke children ----
    ["592007260101", "MOUNTING & FINAL FITMENT", 1, "592007260102", "PAINTED CUBED BODY 26 CBM TATA SIGNA 3530.TK", "NO", 1, "", "", ""],
    ["592007260101", "MOUNTING & FINAL FITMENT", 2, "88CHA3530001", "CHASSIS TATA SIGNA 3530.TK", "NO", 1, "", "", ""],
    ["592007260101", "MOUNTING & FINAL FITMENT", 3, "200210000047", "HYDAULIC KIT HYVA FE 169 -4- 4505", "NO", 1, "", "", ""],
    ["592007260101", "MOUNTING & FINAL FITMENT", 4, "300201M14040", "FLANGED BOLT M14X40 FLANGE CERATED 10.9", "NO", 37, "", "", ""],
    ["592007260101", "MOUNTING & FINAL FITMENT", 5, "300202M14015", "FLANGED NUT M14", "NO", 37, "", "", ""],
    blank,

    // ---- Group 3: 592007260102 (naya child) ke children ----
    ["592007260102", "PAINTED CUBED BODY 26 CBM TATA SIGNA 3530.TK", 1, "592007260103", "FRONT PANEL ASSY", "NO", 1, "", "", ""],
    ["592007260102", "PAINTED CUBED BODY 26 CBM TATA SIGNA 3530.TK", 2, "592007260104", "FLOOR SHEET ASSY", "NO", 1, "", "", ""],
    ["592007260102", "PAINTED CUBED BODY 26 CBM TATA SIGNA 3530.TK", 3, "300201M10030", "FLANGED BOLT M10X30 FLANGE SERATED 8.8", "NO", 24, "", "", ""],
    ["592007260102", "PAINTED CUBED BODY 26 CBM TATA SIGNA 3530.TK", 4, "300202M10010", "FLANGED NUT M10", "NO", 24, "", "", ""],
    blank,

    // ---- Group 4: 592007260103 (naya child) ke children, L/W/T ke saath ----
    ["592007260103", "FRONT PANEL ASSY", 1, "100100000011", "MS PLATE 4MM FRONT PANEL", "NO", 1, 1200, 800, 4],
    ["592007260103", "FRONT PANEL ASSY", 2, "100100000012", "MS ANGLE 50X50X5 STIFFENER", "NO", 2, 800, 50, 5],
    ["592007260103", "FRONT PANEL ASSY", 3, "100100000013", "MS FLAT 40X6 BORDER", "NO", 4, 1200, 40, 6],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  worksheet["!cols"] = [
    { wch: 16 }, // Parent
    { wch: 40 }, // Item
    { wch: 8 },  // S. No.
    { wch: 16 }, // Child
    { wch: 44 }, // Child Name
    { wch: 8 },  // UOM
    { wch: 8 },  // QPV
    { wch: 8 },  // L
    { wch: 8 },  // W
    { wch: 8 },  // T
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BOM Import");
  XLSX.writeFile(workbook, "bom-import-template.xlsx");
}