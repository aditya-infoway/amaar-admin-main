import * as XLSX from 'xlsx';

export type ExportColumn<T> = {
  key: keyof T;
  header: string;
  format?: (value: unknown, row: T) => string;
};

export function exportToExcel<T extends object>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
): void {
  const headers = columns.map((col) => col.header);
  const csvRows = rows.map((row) =>
    columns
      .map((col) => {
        const raw = (row as Record<string, unknown>)[col.key as string];
        const value = col.format ? col.format(raw, row) : String(raw ?? "");
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(","),
  );

  const csv = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf<T extends object>(
  rows: T[],
  columns: ExportColumn<T>[],
  title: string,
  filename: string,
): void {
  const tableHead = columns.map((col) => `<th>${col.header}</th>`).join("");
  const tableBody = rows
    .map((row) => {
      const cells = columns
        .map((col) => {
          const raw = (row as Record<string, unknown>)[col.key as string];
          const value = col.format ? col.format(raw, row) : String(raw ?? "");
          return `<td>${value}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { font-size: 18px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #1a2fa8; color: white; }
    tr:nth-child(even) { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.document.title = filename;
  printWindow.focus();
  printWindow.print();
}


export function importFromExcel<T>(
  file: File,
  columnMapping: { [key: string]: keyof T }
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        const mappedData = jsonData.map((row: any) => {
          const mappedRow: any = {};
          Object.keys(columnMapping).forEach((excelCol) => {
            const targetKey = columnMapping[excelCol];
            mappedRow[targetKey] = row[excelCol] || '';
          });
          return mappedRow as T;
        });
        
        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}