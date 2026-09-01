// export.ts
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

// ─── IMPORT EXCEL FUNCTION ─────────────────────────────────────────────────

export function importFromExcel<T extends object>(
  file: File,
  columnMapping: Record<string, keyof T>,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error("File is empty"));
          return;
        }

        // Parse headers from first line
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Create mapping from Excel headers to object keys
        const headerToKeyMap: Record<string, keyof T> = {};
        headers.forEach((header) => {
          // Try to find matching mapping
          const matchedKey = Object.keys(columnMapping).find(
            (excelHeader) => excelHeader.toLowerCase() === header.toLowerCase()
          );
          if (matchedKey) {
            headerToKeyMap[header] = columnMapping[matchedKey];
          }
        });

        // Parse data rows
        const result: T[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;
          
          // Parse CSV line (handles quoted values)
          const values: string[] = [];
          let currentValue = "";
          let insideQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
              if (insideQuotes && line[j + 1] === '"') {
                // Double quote inside quotes
                currentValue += '"';
                j++;
              } else {
                // Toggle quotes
                insideQuotes = !insideQuotes;
              }
            } else if (char === ',' && !insideQuotes) {
              // End of field
              values.push(currentValue.trim());
              currentValue = "";
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim());

          // Create object from values
          const obj: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            const key = headerToKeyMap[header];
            if (key) {
              const value = values[index] || '';
              // Try to parse numbers
              if (!isNaN(Number(value)) && value !== '') {
                obj[key as string] = Number(value);
              } else {
                obj[key as string] = value;
              }
            }
          });

          // Only add if we have at least some data
          if (Object.keys(obj).length > 0) {
            result.push(obj as T);
          }
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}