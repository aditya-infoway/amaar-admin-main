import { Quotation } from "./data";
import {
    tyreOptions,
    axleOptions,
    hydraulicOptions,
    boxOptions,
    colorOptions,
    chassisOptions,
    getOptionLabel,
} from "./options";
import { masterStorage, getModelLabel } from "../shared/storage";

function escapeHtml(value: string): string {
    return (value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function formatDate(iso: string): string {
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

export function printQuotationHtml(quotation: Quotation): void {
    const modelLabel = getModelLabel(masterStorage.getModels(), quotation.model);
    const tyreLabel = getOptionLabel(tyreOptions, quotation.tyre);
    const axleLabel = getOptionLabel(axleOptions, quotation.axle);
    const hydraulicLabel = getOptionLabel(hydraulicOptions, quotation.hydraulic);
    const boxLabel = getOptionLabel(boxOptions, quotation.box);
    const colorLabel = getOptionLabel(colorOptions, quotation.color);
    const chassisLabel = getOptionLabel(chassisOptions, quotation.chassis);

    const finalPrice = Number(quotation.finalPrice || 0);
    const basicCost = finalPrice / 1.18;
    const gstAmount = finalPrice - basicCost;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Offer - ${escapeHtml(quotation.qNo)}</title>
    <style>
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            @page {
                size: A4 portrait;
                margin: 12mm 15mm 12mm 15mm;
            }
            .invoice-container {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                page-break-inside: avoid !important;
            }
        }
    </style>
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; margin: 0; padding: 10px; background-color: #fff;">

    <div class="invoice-container" style="max-width: 750px; margin: 0 auto; border: 1px solid #ccc; padding: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); page-break-inside: avoid;">

        <!-- Header Section -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
                <td style="width: 35%; vertical-align: top;">
                    <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">To,</div>
                    <div style="font-weight: bold; margin-bottom: 2px;">${escapeHtml(quotation.customerName.toUpperCase())}</div>
                    <table style="font-size: 11px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 1px 4px 1px 0; font-weight: bold; width: 90px;">CONTACT NO.</td>
                            <td style="padding: 1px 4px;">: ${escapeHtml(quotation.mobile)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 1px 4px 1px 0; font-weight: bold;">VILLAGE</td>
                            <td style="padding: 1px 4px;">: ${escapeHtml(quotation.city.toUpperCase())}</td>
                        </tr>
                        <tr>
                            <td style="padding: 1px 4px 1px 0; font-weight: bold;">REF</td>
                            <td style="padding: 1px 4px;">: ${escapeHtml(quotation.position || "-")}</td>
                        </tr>
                    </table>
                </td>
                <td style="width: 30%; text-align: center; vertical-align: top;">
                    <div style="display: inline-block; text-align: center; margin-top: 5px;">
                        <div style="font-size: 20px; font-weight: 900; letter-spacing: 1px; margin-bottom: -2px;">AMAAR</div>
                        <div style="font-size: 9px; font-weight: bold; border-top: 1px solid #000; padding-top: 1px;">MechTech Pvt Ltd</div>
                    </div>
                </td>
                <td style="width: 35%; text-align: right; vertical-align: top; font-size: 11px; font-weight: bold;">
                    <div>Offer:- ${escapeHtml(quotation.qNo)}</div>
                    <div style="margin-top: 2px;">Date:- ${formatDate(quotation.createdAt)}</div>
                </td>
            </tr>
        </table>

        <!-- Subject Line -->
        <div style="font-weight: bold; font-size: 11px; text-align: left; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 4px;">
            Sub:- Price Offer for ${escapeHtml(modelLabel)} with ${escapeHtml(boxLabel)}, ${escapeHtml(hydraulicLabel)} Kit. With ${escapeHtml(tyreLabel)} Tyre ON ${escapeHtml(chassisLabel)}
        </div>

        <!-- Specifications Table (full 18 rows) -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 14.5px;">
            <thead>
                <tr style="border-top: 1px solid #000; border-bottom: 1px solid #000; background-color: #f2f2f2; -webkit-print-color-adjust: exact;">
                    <th style="border: 1px solid #000; padding: 3px; text-align: center; width: 4%;">Sr</th>
                    <th style="border: 1px solid #000; padding: 3px; text-align: left; width: 26%;">Particular</th>
                    <th style="border: 1px solid #000; padding: 3px; text-align: left; width: 70%;">Specification</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">1</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Trailer Detail</td>
                    <td style="border: 1px solid #000; padding: 3px;">${escapeHtml(modelLabel)} (${escapeHtml(boxLabel)})</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">2</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Main Chassis</td>
                    <td style="border: 1px solid #000; padding: 3px;">${escapeHtml(chassisLabel)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">3</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Body Details</td>
                    <td style="border: 1px solid #000; padding: 3px;">Floor 5 mm, Side 4 mm, Front Board- 4mm, Tail Door 4mm</td>
                </tr>
                <tr style="background-color: #e6e6e6; -webkit-print-color-adjust: exact;">
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">4</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Hyd Kit</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">${escapeHtml(hydraulicLabel)} Kit with Pump, PTO</td>
                </tr>
                <tr style="background-color: #e6e6e6; -webkit-print-color-adjust: exact;">
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">5</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Axle</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">${escapeHtml(axleLabel)} Make</td>
                </tr>
                <tr style="background-color: #e6e6e6; -webkit-print-color-adjust: exact;">
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">6</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Suspension</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Front Air Lift &amp; Rear 18T Tandem Mech Suspension with Spread Hanger-York Make</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">7</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Tyre</td>
                    <td style="border: 1px solid #000; padding: 3px;">${escapeHtml(tyreLabel)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">8</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Rim</td>
                    <td style="border: 1px solid #000; padding: 3px;">Wheels India-12 Nos (7.5x20)</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">9</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">King Pin</td>
                    <td style="border: 1px solid #000; padding: 3px;">Bolt-on, York make</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">10</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Landing Leg</td>
                    <td style="border: 1px solid #000; padding: 3px;">Gear Type, York- 25T</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">11</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Brake system</td>
                    <td style="border: 1px solid #000; padding: 3px;">Wabco with ABS Tridem</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">12</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Mudgaurd</td>
                    <td style="border: 1px solid #000; padding: 3px;">Steel Type</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">13</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Paint</td>
                    <td style="border: 1px solid #000; padding: 3px;">Shot blasting+Primer+Finish PU Paint, Color: ${escapeHtml(colorLabel)}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">14</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Electrical &amp; Reflective tapes</td>
                    <td style="border: 1px solid #000; padding: 3px;">As per CMVR</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">15</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">SUPD &amp; RUPD</td>
                    <td style="border: 1px solid #000; padding: 3px;">As per CMVR</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">16</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Tool Box</td>
                    <td style="border: 1px solid #000; padding: 3px;">Std- 01 Nos</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center;">17</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold;">Spare Wheel Carrier</td>
                    <td style="border: 1px solid #000; padding: 3px;">01 Nos</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center; vertical-align: top;">18</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold; vertical-align: top;">Warranty</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: justify; line-height: 1.3;">
                        The quoted trailer &amp; rate is for rated load application only. Standard Warranty against manufacturing defects for 12 months from the date of billing. Consumables, Glass &amp; Rubber parts are not covered under the standard warranty. All other proprietary item warranty will be covered back-to-back with original manufacturer's warranty policy
                    </td>
                </tr>
                ${quotation.remark
            ? `<tr>
                    <td style="border: 1px solid #000; padding: 3px; text-align: center; vertical-align: top;">19</td>
                    <td style="border: 1px solid #000; padding: 3px; font-weight: bold; vertical-align: top;">Remark</td>
                    <td style="border: 1px solid #000; padding: 4px; text-align: justify; line-height: 1.3;">${escapeHtml(quotation.remark)}</td>
                </tr>`
            : ""
        }
            </tbody>
        </table>

        <!-- Pricing Section -->
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
            <tr style="background-color: #f2f2f2; -webkit-print-color-adjust: exact; font-weight: bold;">
                <td colspan="2" style="border: 1px solid #000; padding: 4px; text-align: center;">Price @ Ex- Jalida Plant</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; width: 30%; padding-left: 25px; font-weight: bold;">Basic Cost/Trailer</td>
                <td style="border: 1px solid #000; padding: 4px; width: 70%; font-weight: bold;">${formatCurrency(basicCost)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; padding-left: 25px; font-weight: bold;">GST @ 18%</td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${formatCurrency(gstAmount)}</td>
            </tr>
            <tr style="background-color: #f9f9f9; -webkit-print-color-adjust: exact;">
                <td style="border: 1px solid #000; padding: 4px; padding-left: 25px; font-weight: bold;">Landed Cost/Trailer</td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${formatCurrency(finalPrice)}</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; padding-left: 25px; font-weight: bold;">Total Qty (No's)</td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">1</td>
            </tr>
            <tr style="background-color: #f5f5f5; -webkit-print-color-adjust: exact;">
                <td style="border: 1px solid #000; padding: 4px; padding-left: 25px; font-weight: bold;">Total Amount incl. GST</td>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">${formatCurrency(finalPrice)}</td>
            </tr>
        </table>

        <!-- Terms and Conditions -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
                <td style="border: 1px solid #000; padding: 4px; width: 30%; font-weight: bold; text-align: right; padding-right: 15px; background-color: #fafafa; -webkit-print-color-adjust: exact;">Payment Terms</td>
                <td style="border: 1px solid #000; padding: 4px; width: 70%; padding-left: 10px;">40% Advance &amp; 60 % Before Delivery</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: right; padding-right: 15px; background-color: #fafafa; -webkit-print-color-adjust: exact;">Delivery Schedule</td>
                <td style="border: 1px solid #000; padding: 4px; padding-left: 10px;">20 to 25 days from the date of valid PO along with advance booking received.</td>
            </tr>
            <tr>
                <td style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: right; padding-right: 15px; background-color: #fafafa; -webkit-print-color-adjust: exact;">Quotation Validity</td>
                <td style="border: 1px solid #000; padding: 4px; padding-left: 10px;">5 Days</td>
            </tr>
        </table>

        <!-- Footnote -->
        <div style="font-size: 11px; font-weight: bold; margin-bottom: 25px;">
            Note:- 1. Above Configuration is Legally for 54T passing. RTO &amp; Passing will be on customer scope only.
        </div>

        
    </div>

</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
}