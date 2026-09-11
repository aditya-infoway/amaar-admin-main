import { createColumnHelper } from "@tanstack/react-table";
import type { SalesOrder } from "../shared/types";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { URL as ApiUrl, toasterrormsg } from "@/ApiHelper";
import type { ExportColumn } from "../shared/export";

const columnHelper = createColumnHelper<SalesOrder>();

// Fetches a cross-origin file as a blob and triggers a real browser
// download (a plain <a download> won't work across origins).
const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

// Fetches a cross-origin file as a blob and triggers a real browser
// download (a plain <a download> won't work across origins).
// We force the correct MIME type from the file extension rather than
// trusting the server's Content-Type header, so the OS always
// recognizes it as an image instead of falling back to some other
// default app.
const downloadFile = async (
  relativePath: string,
  suggestedName: string,
) => {
  try {
    if (!relativePath) {
      toasterrormsg("File not found");
      return;
    }

    const url = /^https?:\/\//i.test(relativePath)
      ? relativePath
      : `${ApiUrl.localurl}${relativePath.replace(/^\/+/, "")}`;

    console.log("========== FILE DOWNLOAD ==========");
    console.log("Path:", relativePath);
    console.log("URL:", url);

    const response = await fetch(url);

    console.log("Status:", response.status);
    console.log(
      "Content-Type:",
      response.headers.get("content-type"),
    );
    console.log(
      "Content-Disposition:",
      response.headers.get("content-disposition"),
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const blob = await response.blob();

    console.log("Blob Type:", blob.type);
    console.log("Blob Size:", blob.size);

    // Detect extension
    let ext = "";

    const contentType = (
      response.headers.get("content-type") ||
      blob.type ||
      ""
    ).toLowerCase();

    if (contentType.includes("png")) {
      ext = "png";
    } else if (
      contentType.includes("jpeg") ||
      contentType.includes("jpg")
    ) {
      ext = "jpg";
    } else if (contentType.includes("webp")) {
      ext = "webp";
    } else if (contentType.includes("gif")) {
      ext = "gif";
    } else if (contentType.includes("pdf")) {
      ext = "pdf";
    } else {
      // fallback from original path
      const cleanPath = relativePath.split("?")[0];
      const pathExt = cleanPath
        .split(".")
        .pop()
        ?.toLowerCase();

      if (
        pathExt &&
        ["png", "jpg", "jpeg", "webp", "gif", "pdf"].includes(
          pathExt,
        )
      ) {
        ext = pathExt;
      }
    }

    if (!ext) {
      console.error("Unknown file type:", contentType);
      throw new Error(
        `Server returned unsupported file type: ${contentType}`,
      );
    }

    const mimeTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      pdf: "application/pdf",
    };

    const fileBlob = new Blob([blob], {
      type: mimeTypes[ext],
    });

    const blobUrl = window.URL.createObjectURL(fileBlob);

    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = `${suggestedName}.${ext}`;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    console.log(
      `Downloaded: ${suggestedName}.${ext}`,
    );
  } catch (error) {
    console.error("Download error:", error);
    toasterrormsg("Unable to download file.");
  }
};
const RowActions = createRowActions<SalesOrder>("sales order", {
  withView: true,
  extraItems: (row) => {
    const item = row as any;

    return [
      {
        key: "aadhar",
        label: "Aadhar Card",
        show: !!item.aadharImage,
        onClick: () =>
          downloadFile(
            item.aadharImage,
            `Aadhar_${item.soNo || item.id}`,
          ),
      },
      {
        key: "pan",
        label: "PAN Card",
        show: !!item.panImage,
        onClick: () =>
          downloadFile(item.panImage, `PAN_${item.soNo || item.id}`),
      },
      {
        key: "gst",
        label: "GST Card",
        show: !!item.gstImage,
        onClick: () =>
          downloadFile(item.gstImage, `GST_${item.soNo || item.id}`),
      },
    ];
  },
});

export const createColumns = (
  modelOptions: { id: string; label: string }[] = [],
) => {
  const modelLabelById = new Map(
    modelOptions.map((item) => [item.id, item.label]),
  );

  return [
    columnHelper.display({
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableSorting: false,
    }),

    columnHelper.display({
      id: "srNo",
      header: "Sr. No.",
      cell: ({ row, table }) => {
        const pagination = table.getState().pagination;

        return (
          pagination.pageIndex * pagination.pageSize +
          row.index +
          1
        );
      },
    }),

    columnHelper.accessor("soNo", {
      header: "SO No",
      cell: ({ getValue }) => (
        <span className="font-medium">
          {getValue() || "-"}
        </span>
      ),
    }),

    columnHelper.accessor("quotationId", {
      header: "Quotation",
      cell: ({ row }) =>
        (row.original as any).qNo ||
        row.original.quotationId ||
        "-",
    }),

    columnHelper.accessor("customerName", {
      header: "Customer Name",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("mobile", {
      header: "Mobile",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("city", {
      header: "City",
      cell: ({ getValue }) => getValue() || "-",
    }),

    columnHelper.accessor("model", {
      header: "Model",
      cell: ({ row }) => {
        const item = row.original as any;

        return (
          item.modelName ||
          modelLabelById.get(String(item.model)) ||
          item.model ||
          "-"
        );
      },
    }),

    columnHelper.accessor("qty", {
      header: "Qty",
      cell: ({ getValue }) => getValue() ?? 0,
    }),

    columnHelper.accessor("totalAmount", {
      header: "Total Amount",
      cell: ({ getValue }) => {
        const amount = Number(getValue()) || 0;

        return `₹ ${amount.toLocaleString("en-IN")}`;
      },
    }),

    columnHelper.accessor("mode", {
      header: "Mode",
      cell: ({ getValue }) => {
        const mode = getValue();

        return mode === "manual" ? "Manual" : "As Its";
      },
    }),

    columnHelper.display({
      id: "kyc",
      header: "KYC",
      cell: ({ row }) => {
        const item = row.original as any;

        const hasAadhar =
          !!item.aadharNumber || !!item.aadharImage;

        const hasPan =
          !!item.panNumber || !!item.panImage;

        const hasGst =
          !!item.gstNumber || !!item.gstImage;

        if (!hasAadhar && !hasPan && !hasGst) {
          return (
            <span className="text-gray-400">
              -
            </span>
          );
        }

        return (
          <div className="flex flex-wrap gap-1">
            {hasAadhar && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                Aadhar
              </span>
            )}

            {hasPan && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                PAN
              </span>
            )}

            {hasGst && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                GST
              </span>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "Action",
      cell: RowActions,
      enableSorting: false,
    }),
  ];
};

/*
 * Columns used for Excel/PDF export
 */
export const createExportColumns = (): ExportColumn<SalesOrder>[] => [
  {
    key: "soNo",
    header: "SO No",
  },
  {
    key: "qNo",
    header: "Quotation",
  },
  {
    key: "customerName",
    header: "Customer Name",
  },
  {
    key: "mobile",
    header: "Mobile",
  },
  {
    key: "city",
    header: "City",
  },
  {
    key: "modelName",
    header: "Model",
  },
  {
    key: "qty",
    header: "Qty",
  },
  {
    key: "unitPrice",
    header: "Unit Price",
  },
  {
    key: "totalAmount",
    header: "Total Amount",
  },
  {
    key: "mode",
    header: "Mode",
  },
  {
    key: "aadharNumber",
    header: "Aadhar Number",
  },
  {
    key: "panNumber",
    header: "PAN Number",
  },
  {
    key: "gstNumber",
    header: "GST Number",
  },
];