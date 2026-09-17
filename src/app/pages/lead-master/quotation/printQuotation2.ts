import { Quotation } from "../shared/types";
import { Get } from "@/ApiHelper";

function escapeHtml(value?: string | null): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function formatCurrency(value: number): string {
  return `&#8377; ${Math.round(value).toLocaleString("en-IN")}`;
}

// Parses a JSON-stringified Quill Delta (saved from the Warranty rich
// text editor) into escaped HTML with line breaks preserved.
function warrantyDeltaToHtml(raw?: string | null): string {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    const ops = parsed?.ops || [];

    const text = ops
      .map((op: any) => (typeof op.insert === "string" ? op.insert : ""))
      .join("");

    return escapeHtml(text).replace(/\n/g, "<br>");
  } catch (error) {
    console.error("Failed to parse warranty content", error);
    return "";
  }
}

type CompanyBranding = {
  logoDataUrl: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  mobile: string;
  phone: string;
  email: string;
  gstNo: string;
};

// Fetches the company profile saved under Settings > General and embeds the
// logo as a base64 data URL so it renders reliably in the print/preview
// window (avoids broken images from relative paths or CORS issues on a
// plain <img src>).
async function fetchCompanyBranding(): Promise<CompanyBranding> {
  const fallback: CompanyBranding = {
    logoDataUrl: "",
    companyName: "AMAAR MechTech Pvt Ltd",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    mobile: "",
    phone: "",
    email: "",
    gstNo: "",
  };

  try {
    const companyDetailsId = localStorage.getItem("companyDetailsId");
    if (!companyDetailsId) return fallback;

    const res = await Get(
      "superadmin/company-details",
      { companyDetailsId },
      false,
    );

    const d = res?.data?.data;
    if (!d) return fallback;

    let logoDataUrl = "";
    if (d.logo) {
      try {
        const imgRes = await fetch(d.logo);
        const blob = await imgRes.blob();
        logoDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Failed to embed company logo, using direct URL", error);
        logoDataUrl = d.logo; // fallback: use the raw URL as-is
      }
    }

    return {
      logoDataUrl,
      companyName: d.companyName || fallback.companyName,
      addressLine1: d.addressLine1 || "",
      addressLine2: d.addressLine2 || "",
      city: d.city || "",
      state: d.state || "",
      pinCode: d.pinCode || "",
      mobile: d.mobile || "",
      phone: d.phone || "",
      email: d.email || "",
      gstNo: d.gstNo || "",
    };
  } catch (error) {
    console.error("Failed to fetch company branding for print", error);
    return fallback;
  }
}

export async function printQuotationHtml2(quotation: Quotation): Promise<void> {
  // --------------------------------------------------------
  // FETCH LIVE MASTER DATA (same sources the Drawer uses)
  // --------------------------------------------------------
  let masterItems: any[] = [];
  let modelItems: any[] = [];
  let branding: CompanyBranding = {
    logoDataUrl: "",
    companyName: "AMAAR MechTech Pvt Ltd",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    mobile: "",
    phone: "",
    email: "",
    gstNo: "",
  };

  try {
    const [masterRes, modelRes, brandingRes] = await Promise.all([
      Get("master/createmaster/list", {}, false),
      Get("master/model/list", {}, false),
      fetchCompanyBranding(),
    ]);

    masterItems = masterRes?.data?.data || [];
    modelItems = modelRes?.data?.data || [];
    branding = brandingRes;
  } catch (error) {
    console.error("Print2 quotation: failed to load master data", error);
  }

  const getDesc = (id: any): string => {
    if (id === null || id === undefined || id === "") return "—";

    const match = masterItems.find(
      (item) => String(item.createMasterId) === String(id),
    );

    return match?.description || "—";
  };

  const modelLabel = (() => {
    if (!quotation.model) return "—";

    const match = modelItems.find(
      (item) => String(item.modelId ?? item.id) === String(quotation.model),
    );

    return match?.modelName ?? match?.label ?? "—";
  })();

  const trailerLabel = getDesc(quotation.trailer);
  const chassisLabel = getDesc(quotation.chassis);
  const bodyLabel = getDesc(quotation.body);
  const hydraulicLabel = getDesc(quotation.hydraulic);
  const axleLabel = getDesc(quotation.axle);
  const suspensionLabel = getDesc(quotation.suspension);
  const tyreLabel = getDesc(quotation.tyre);
  const rimLabel = getDesc(quotation.rim);
  const kingPinLabel = getDesc(quotation.kingPin);
  const landingLegLabel = getDesc(quotation.landingLeg);
  const brakeSystemLabel = getDesc(quotation.brakeSystem);
  const mudguardLabel = getDesc(quotation.mudguard);
  const colorLabel = getDesc(quotation.color);
  const electricalTapesLabel = getDesc(quotation.electricalTapes);
  const supdRupdLabel = getDesc(quotation.supdRupd);
  const boxLabel = getDesc(quotation.box);
  const spareWheelCarrierLabel = getDesc(quotation.spareWheelCarrier);

  // --------------------------------------------------------
  // PRICING — use the values already saved on the quotation
  // --------------------------------------------------------
  const basicCost = Number(quotation.basicCost || 0);
  const gstAmount = Number(quotation.gstAmount || 0);
  const finalPrice = Number(quotation.finalPrice || 0);

  // Same "optionalForTipper" logic as QuotationDrawer.validatePrices()/the
  // conditional rendering in the drawer: for a Tipper quotation these fields
  // don't exist on the form at all, so they're skipped in the printed spec
  // table too. For Trailer, every row still shows exactly as before.
  const isTipper = (quotation as any).vehicleType === "tipper";

  const allSpecRows: Array<[string, string, boolean?, boolean?]> = [
    // [label, value, highlight, optionalForTipper]
    [isTipper ? "Tipper Detail" : "Trailer Detail", trailerLabel],
    ["Main Chassis", chassisLabel],
    ["Body Details", bodyLabel],
    ["Hyd Kit", hydraulicLabel],
    ["Axle", axleLabel, false, true],
    ["Suspension", suspensionLabel, false, true],
    ["Tyre", tyreLabel, false, true],
    ["Rim", rimLabel, false, true],
    ["King Pin", kingPinLabel],
    ["Landing Leg", landingLegLabel, false, true],
    ["Brake system", brakeSystemLabel, false, true],
    ["Mudgaurd", mudguardLabel],
    ["Paint", colorLabel],
    ["Electrical & Reflective tapes", electricalTapesLabel, false, true],
    ["SUPD & RUPD", supdRupdLabel],
    ["Tool Box", boxLabel],
    ["Spare Wheel Carrier", spareWheelCarrierLabel, false, true],
  ];

  const specRows: Array<[string, string, boolean?]> = allSpecRows
    .filter(([, , , optionalForTipper]) => !(isTipper && optionalForTipper))
    .map(([label, value, highlight]) => [label, value, highlight]);

  const specRowsHtml = specRows
    .map(
      ([label, value, highlight], idx) => `
                <tr${highlight ? ' style="background-color: #eef4ff;"' : ""}>
                    <td class="sr-cell">${idx + 1}</td>
                    <td class="label-cell">${escapeHtml(label)}</td>
                    <td class="value-cell">${escapeHtml(value)}</td>
                </tr>`,
    )
    .join("");

  const warrantyRow = `
                <tr>
                    <td class="sr-cell" style="vertical-align: top;">${specRows.length + 1}</td>
                    <td class="label-cell" style="vertical-align: top;">Warranty</td>
                    <td class="value-cell" style="text-align: justify; line-height: 1.4;">${warrantyDeltaToHtml(quotation.warranty) || "—"}</td>
                </tr>`;

  const remarkRow = quotation.remark
    ? `
                <tr>
                    <td class="sr-cell" style="vertical-align: top;">${specRows.length + 2}</td>
                    <td class="label-cell" style="vertical-align: top;">Remark</td>
                    <td class="value-cell" style="text-align: justify; line-height: 1.4;">${escapeHtml(quotation.remark)}</td>
                </tr>`
    : "";

  const companyAddressLine = [branding.addressLine1, branding.addressLine2]
    .filter(Boolean)
    .join(", ");
  const companyCityLine = [branding.city]
    .filter(Boolean)
    .join(", ");
  const companyContactLine = [
    branding.mobile ? `Mobile: ${branding.mobile}` : "",
    branding.phone ? `Phone: ${branding.phone}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  // Watermark HTML - only rendered if a logo exists
  const watermarkHtml = branding.logoDataUrl
    ? `<div class="watermark"><img src="${branding.logoDataUrl}" alt="Watermark" /></div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Offer - ${escapeHtml(quotation.qNo)}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 30px;
            color: #1f2937;
            margin: 0;
            padding: 10px;
            background-color: #fff;
            position: relative;
        }
        
        /* Watermark styling */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
            opacity:   0.15; /* Very light, faint show */
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .watermark img {
            width: 500px;
            height: auto;
            max-width: 80vw;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            background-color: transparent; /* Transparent to show watermark */
            position: relative;
            z-index: 1;
        }
        .card {
            border: 1px solid #d7e0ef;
            border-radius: 8px;
            padding: 10px 12px 10px 18px;
            margin-bottom: 10px;
            background-color: #fff; /* Company card stays white */
        }
        .card-title {
            color: #1450b4;
            font-weight: 700;
            font-size: 13.5px;
            margin-bottom: 6px;
        }
        .section-bar {
            background-color: #1450b4;
            color: #fff;
            font-weight: 700;
            font-size: 13px;
            padding: 5px 12px 5px 18px;
            border: 1px solid #1450b4;
            border-radius: 6px 6px 0 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .section-body {
            border: 1px solid #d7e0ef;
            border-top: none;
            border-radius: 0 0 6px 6px;
            padding: 8px 12px 8px 18px;
            margin-bottom: 10px;
            background-color: transparent; /* Transparent to show watermark */
        }

        /* Specific background colors for sections */
        .section-body.spec-body {
            background-color: #f8fafc; /* Light blue tint for specification */
        }
        .section-body.price-body {
            background-color: #f1f5f9; /* Light gray for price */
        }
        .section-body.terms-body {
            background-color: #f8fafc; /* Light gray for terms */
        }
        .section-body.customer-body {
            background-color: #fff; /* White for customer details */
        }

        /* Company Details section */
        .company-section {
            display: flex;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 14px;
        }
        .company-info {
            flex: 1;
            text-align: left;
        }
        .company-name {
            font-size: 20px;
            font-weight: 800;
            color: #1450b4;
            margin-bottom: 3px;
        }
            .company-meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
}
.company-meta-row .company-line {
    padding: 0;
}
        .company-line {
            font-size: 12px;
            padding: 1px 0;
            display: flex;
            align-items: center;
            justify-content: flex-start; 
            gap: 6px;
        }
        .company-line svg {
            width: 12px;
            height: 12px;
            fill: #1450b4;
            flex-shrink: 0;
        }
        .logo-box {
            text-align: center;
            padding: 7px 10px;
            margin-right: 20px; /* Added space between logo and company details */
            flex-shrink: 0;
        }
        .company-logo-img {
            max-height: 58px;
            max-width: 210px;
            object-fit: contain;
        }
        .logo-title {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #1450b4;
        }
        .logo-sub {
            font-size: 9.5px;
            font-weight: 700;
            border-top: 1px solid #1450b4;
            padding-top: 2px;
            display: inline-block;
            margin-top: -1px;
        }

        /* Customer Details section - Vertical Layout */
        .info-row-vertical {
            display: flex;
            font-size: 12.5px;
            padding: 3px 0;
            align-items: center;
        }
        .info-label-vertical {
            font-weight: 700;
            width: 130px;
            flex-shrink: 0;
            color: #1450b4;
        }
        .field-value {
            display: inline-block;
            min-width: 150px;
            border-bottom: 1px solid #9ca3af;
            padding: 0 6px 3px;
            margin-left: 2px;
            font-weight: 600;
        }
        .dynamic-data {
            padding-left: 0; /* Removed extra left space */
            padding-bottom: 0;
        }
        .info-label-inline {
            font-weight: 700;
            margin-right: 4px;
        }
        .offer-meta {
            font-size: 11.5px;
            font-weight: 700;
            margin-top: 6px;
            text-align: right;
        }

        table.spec-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
        }
        table.spec-table thead tr {
            background-color: #eef4ff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        table.spec-table th, table.spec-table td {
            border: 1px solid #d7e0ef;
            padding: 4px 6px;
        }
        .sr-cell { text-align: center; width: 4%; }
        .label-cell { font-weight: 700; width: 26%; }
        .value-cell { width: 70%; }

        table.price-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
        }
        table.price-table td {
            border: 1px solid #eef1f6;
            padding: 4px 8px;
        }
        .price-label {
            font-weight: 700;
            width: 55%;
        }
        .price-value {
            font-weight: 700;
            text-align: right;
        }
        .price-highlight {
            background-color: #eef4ff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        table.terms-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        table.terms-table td {
            border: 1px solid #eef1f6;
            padding: 4px 8px;
        }
        .terms-label {
            font-weight: 700;
            color: #1450b4;
            width: 30%;
        }

        /* Signature section */
        .signature-grid {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 10px;
        }
        .signature-box {
            flex: 1;
            border: 1px solid #d7e0ef;
            border-radius: 6px;
            padding: 8px 12px;
            text-align: center;
            background-color: #fff;
        }
        .signature-space {
            height: 45px;
        }
        .signature-line {
            border-top: 1px solid #1f2937;
            padding-top: 4px;
            font-weight: 700;
            font-size: 12px;
        }

        .footnote {
            font-size: 10.5px;
            font-weight: 700;
            margin-top: 8px;
        }

        /* Floating print button — screen only, hidden in the actual print output */
        .print-btn {
            position: fixed;
            bottom: 22px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #1450b4;
            color: #fff;
            border: none;
            padding: 11px 24px;
            border-radius: 24px;
            font-size: 13px;
            font-weight: 700;
            font-family: Arial, Helvetica, sans-serif;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
            z-index: 999;
        }
        .print-btn:hover {
            background-color: #0f3d8a;
        }

        @media print {
            html, body {
                width: 210mm;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                overflow: hidden;
            }
            @page {
                size: A4 portrait;
                margin: 5mm 8mm;
            }
            .invoice-container {
                max-width: 100%;
                box-shadow: none;
                padding: 8px;
                background-color: transparent;
            }
            .section-body {
                background-color: transparent !important; /* Ensure watermark shows */
            }
            .print-btn {
                display: none !important;
            }
            body { font-size: 12px; }
            .section-bar { font-size: 12px; padding: 4px 10px 4px 16px; }
             .company-name { font-size: 18px; }
            .company-line { font-size: 11px; }
            .info-row-vertical { font-size: 11.5px; }
            .info-label-vertical { width: 120px; }
            .field-value { min-width: 130px; }
            table.spec-table { font-size: 11.5px; }
            table.price-table { font-size: 11.5px; }
            table.terms-table { font-size: 11px; }
            .signature-line { font-size: 11px; }
            .footnote { font-size: 10px; }
        }
    </style>
</head>
<body>
    ${watermarkHtml}
    
    <div class="invoice-container">

        <!-- Company Details Section (full width, no title bar): logo left, details right -->
        <div class="card">
            <div class="company-section">
                <div class="logo-box">
                    ${
                      branding.logoDataUrl
                        ? `<img src="${branding.logoDataUrl}" alt="${escapeHtml(branding.companyName)}" class="company-logo-img" />`
                        : `<div class="logo-title">${escapeHtml(branding.companyName.split(" ")[0] || "AMAAR")}</div>
                           <div class="logo-sub">${escapeHtml(branding.companyName)}</div>`
                    }
                </div>
                               <div class="company-info">
                    <div class="company-name">${escapeHtml(branding.companyName)}</div>

                    <!-- City | Mobile | Email — same row -->
                    <div class="company-meta-row">
                        ${
                          companyCityLine
                            ? `<div class="company-line">
                                 <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                 <span>${escapeHtml(companyCityLine)}</span>
                               </div>`
                            : ""
                        }
                        ${
                          companyContactLine
                            ? `<div class="company-line">
                                 <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                 <span>${escapeHtml(companyContactLine)}</span>
                               </div>`
                            : ""
                        }
                        ${
                          branding.email
                            ? `<div class="company-line">
                                 <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                 <span>Email: ${escapeHtml(branding.email)}</span>
                               </div>`
                            : ""
                        }
                    </div>

                    <!-- Address — sabse neeche -->
                    ${
                      companyAddressLine
                        ? `<div class="company-line">
                             <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                             <span>${escapeHtml(companyAddressLine)}</span>
                           </div>`
                        : ""
                    }
                    ${
                      branding.gstNo
                        ? `<div class="company-line">
                             <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                             <span>GSTIN: ${escapeHtml(branding.gstNo)}</span>
                           </div>`
                        : ""
                    }
                </div>
            </div>
        </div>

        <!-- Customer Details Section: Vertical Layout with fields stacked -->
        <div class="section-bar">Customer Details</div>
        <div class="section-body customer-body">
            <div class="dynamic-data">
                <div class="info-row-vertical">
                    <span class="info-label-vertical">Quotation No:</span>
                    <span class="field-value">${escapeHtml((quotation.qNo || "").toUpperCase())}</span>
                </div>
                <div class="info-row-vertical">
                    <span class="info-label-vertical">Quotation Date:</span>
                    <span class="field-value">${escapeHtml((formatDate(quotation.createdAt)).toUpperCase())}</span>
                </div>
                <div class="info-row-vertical">
                    <span class="info-label-vertical">Name:</span>
                    <span class="field-value">${escapeHtml((quotation.customerName || "").toUpperCase())}</span>
                </div>
                <div class="info-row-vertical">
                    <span class="info-label-vertical">Contact No.:</span>
                    <span class="field-value">${escapeHtml(quotation.mobile)}</span>
                </div>
                <div class="info-row-vertical">
                    <span class="info-label-vertical">Village:</span>
                    <span class="field-value">${escapeHtml((quotation.city || "").toUpperCase())}</span>
                </div>
            </div>
        </div>

        <!-- Specification Section -->
        <div class="section-bar">Specification Details</div>
        <div class="section-body spec-body" style="padding: 0; border-top: none;">
            <table class="spec-table">
                <thead>
                    <tr>
                        <th class="sr-cell">Sr</th>
                        <th class="label-cell" style="text-align:left;">Particular</th>
                        <th class="value-cell" style="text-align:left;">Specification</th>
                    </tr>
                </thead>
                <tbody>
                    ${specRowsHtml}
                    ${warrantyRow}
                    ${remarkRow}
                </tbody>
            </table>
        </div>

        <!-- Pricing Section -->
        <div class="section-bar">Price @ Ex- Jalida Plant</div>
        <div class="section-body price-body" style="padding: 0; border-top: none;">
            <table class="price-table">
                <tr>
                    <td class="price-label">Basic Cost/Trailer</td>
                    <td class="price-value">${formatCurrency(basicCost)}</td>
                </tr>
                <tr>
                    <td class="price-label">GST @ 18%</td>
                    <td class="price-value">${formatCurrency(gstAmount)}</td>
                </tr>
                <tr >
                    <td class="price-label">Landed Cost/Trailer</td>
                    <td class="price-value">${formatCurrency(finalPrice)}</td>
                </tr>
                <tr>
                    <td class="price-label">Total Qty (No's)</td>
                    <td class="price-value">1</td>
                </tr>
                <tr >
                    <td class="price-label">Total Amount incl. GST</td>
                    <td class="price-value">${formatCurrency(finalPrice)}</td>
                </tr>
            </table>
        </div>

        <!-- Terms and Conditions -->
        <div class="section-bar">Terms &amp; Conditions</div>
        <div class="section-body terms-body" style="padding: 0; border-top: none;">
            <table class="terms-table">
                <tr>
                    <td class="terms-label">Payment Terms</td>
                    <td>40% Advance &amp; 60% Before Delivery</td>
                </tr>
                <tr>
                    <td class="terms-label">Delivery Schedule</td>
                    <td>20 to 25 days from the date of valid PO along with advance booking received.</td>
                </tr>
                <tr>
                    <td class="terms-label">Quotation Validity</td>
                    <td>5 Days</td>
                </tr>
            </table>
        </div>

        <!-- Signature Section -->
        <div class="signature-grid">
            <div class="signature-box">
                <div class="signature-space"></div>
                <div class="signature-line">Customer Signature</div>
            </div>
            <div class="signature-box">
                <div class="signature-space"></div>
                <div class="signature-line">Sales Executive Signature</div>
            </div>
        </div>

    </div>

    <!-- On-screen only: lets the user trigger the browser print dialog directly -->
    <button class="print-btn" onclick="window.print()">🖨️ Print</button>
</body>
</html>
`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}