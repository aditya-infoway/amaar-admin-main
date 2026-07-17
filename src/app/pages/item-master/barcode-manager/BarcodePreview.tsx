import Barcode from "react-barcode";

export function BarcodePreview({
  value,
  height = 40,
  width = 1.4,
  fontSize = 12,
}: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
}) {
  if (!value) {
    return <span className="text-xs text-gray-400 italic">Not generated</span>;
  }

  return (
    <Barcode
      value={value}
      format="CODE128"
      height={height}
      width={width}
      fontSize={fontSize}
      margin={4}
      displayValue={true}
    />
  );
}