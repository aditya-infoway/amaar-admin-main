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
