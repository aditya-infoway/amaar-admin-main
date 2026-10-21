import { Getter } from "@tanstack/react-table";

import { Badge } from "@/components/ui";
import { Highlight } from "@/components/shared/Highlight";
import { ensureString } from "@/utils/ensureString";
import { statusOptions } from "./constants";

export function TextCell({
  getValue,
  table,
}: {
  getValue: Getter<string>;
  table: { getState: () => { globalFilter?: string } };
}) {
  const globalQuery = ensureString(table.getState().globalFilter);
  const value = getValue() || "—";

  return (
    <span className="dark:text-dark-100 text-gray-800">
      <Highlight query={globalQuery}>{value}</Highlight>
    </span>
  );
}

export function StatusCell({ getValue }: { getValue: Getter<string> }) {
  const value = getValue();
  const status = statusOptions.find((item) => item.id === value);

  return (
    <Badge
      color={value === "active" ? "success" : "neutral"}
      variant="soft"
    >
      {status?.label || value || "—"}
    </Badge>
  );
}
