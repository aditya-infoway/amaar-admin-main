export interface AccountGroup {
  id: string;
  groupName: string; // main group (typed)
  groupId: string; // sub group (group master id)
  subGroupName: string;
  status: string;
  created: string;
}

export const emptyAccountGroup = (): AccountGroup => ({
  id: "",
  groupName: "",
  groupId: "",
  subGroupName: "",
  status: "active",
  created: "",
});

export const mapApiAccountGroupToAccountGroup = (item: any): AccountGroup => ({
  id: String(item.id),
  groupName: item.groupName || "",
  groupId: String(item.groupId ?? ""),
  subGroupName: item.subGroupName || "",
  status: item.status || "active",
  created: item.created || "",
});

export const formatCreatedDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatCreatedTime = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
