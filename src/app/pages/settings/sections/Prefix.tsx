import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

interface PrefixItem {
  prefixId: number;
  prefixFor: string;
  prefix: string;
}

interface PrefixFormValues {
  prefixFor: string;
  prefix: string;
}

// 👇 Naye prefix types yahan add karte jao, backend me kuch change nahi karna
// StyledListbox ko "id" field chahiye value match karne ke liye, "label" displayField ke liye
const prefixForOptions = [
  { id: "PURCHASE", label: "PURCHASE" },
  { id: "PURCHASE ORDER", label: "PURCHASE ORDER" },
  { id: "CASH RECEIPT", label: "CASH RECEIPT" },
  { id: "BANK RECEIPT", label: "BANK RECEIPT" },
  { id: "CASH PAYMENT", label: "CASH PAYMENT" },
  { id: "BANK PAYMENT", label: "BANK PAYMENT" },
  { id: "CONTRA", label: "CONTRA" },
  { id: "LEAD", label: "LEAD" },
  { id: "QUOTATION", label: "QUOTATION" },
];

const schema = yup.object({
  prefixFor: yup.string().required("Prefix For is required"),
  prefix: yup
    .string()
    .required("Prefix is required")
    .max(20, "Max 20 characters"),
});

export default function Prefix() {
  const [prefixes, setPrefixes] = useState<PrefixItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrefixFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { prefixFor: "", prefix: "" },
  });

  useEffect(() => {
    fetchPrefixes();
  }, []);

  // NOTE: aapka backend har case me HTTP 200 hi bhejta he (successResponse
  // / errorResponse / requiredmessage sab res.send karte he, res.status()
  // set nahi karte). Isliye axios/apiHelper "catch" sirf real network error
  // pakdega — business error (jaise validation fail, duplicate prefix) ke
  // liye res.data.success/status check karna zaroori he, warna message
  // kabhi dikhega hi nahi.

  const fetchPrefixes = async () => {
    try {
      // useHeader = false -> apiHelper sends application/json headers
      const res = await Get("superadmin/prefix/list", {}, false);

      if (res.data?.success) {
        setPrefixes(res.data.data || []);
      } else {
        toasterrormsg(res.data?.message || "Failed to load prefixes");
      }
    } catch (error: any) {
      console.error(error);
      toasterrormsg(error?.response?.data?.message || "Failed to load prefixes");
    }
  };

  const onSubmit = async (values: PrefixFormValues) => {
    try {
      setSaving(true);

      const res = editingId
        ? await Post(
            "superadmin/prefix/update",
            {
              prefixId: editingId,
              prefixFor: values.prefixFor,
              prefix: values.prefix,
            },
            false,
          )
        : await Post("superadmin/prefix/create", values, false);

      // API jo bhi message bheje (success ya error dono), wahi toast me dikhao
      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Saved successfully");
        reset({ prefixFor: "", prefix: "" });
        setEditingId(null);
        fetchPrefixes();
      } else {
        toasterrormsg(res.data?.message || "Failed to save prefix");
      }
    } catch (error: any) {
      console.error(error);
      toasterrormsg(error?.response?.data?.message || "Failed to save prefix");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: PrefixItem) => {
    setEditingId(item.prefixId);
    reset({ prefixFor: item.prefixFor, prefix: item.prefix });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset({ prefixFor: "", prefix: "" });
  };

  return (
    <div className="w-full">
      <div className="mt-2">
        <h3 className="mb-4 text-lg font-semibold">Prefix Settings</h3>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <Controller
            name="prefixFor"
            control={control}
            render={({ field }) => (
              <Listbox
                label="Prefix For"
                error={errors.prefixFor?.message}
                data={prefixForOptions}
                value={
                  prefixForOptions.find((item) => item.id === field.value) || null
                }
                onChange={(item: any) => field.onChange(item?.id || "")}
                placeholder="Select Prefix For"
                displayField="label"
              />
            )}
          />

          <Controller
            name="prefix"
            control={control}
            render={({ field }) => (
              <Input
                label="Prefix"
                placeholder="CUS"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                error={errors.prefix?.message}
              />
            )}
          />

          <div className="flex items-end gap-2">
            <Button type="submit" color="primary" disabled={saving}>
              {editingId ? "Update Prefix" : "Add Prefix"}
            </Button>
            {editingId && (
              <Button type="button" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 max-h-125 overflow-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-0 bg-white dark:bg-gray-900">
            <tr>
              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-left dark:bg-gray-900">
                Prefix For
              </th>
              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-left dark:bg-gray-900">
                Prefix
              </th>
              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-center dark:bg-gray-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {prefixes.length === 0 ? (
              <tr>
                <td colSpan={3} className="border border-gray-700 p-3 text-center text-gray-500">
                  No prefixes added yet
                </td>
              </tr>
            ) : (
              prefixes.map((item) => (
                <tr key={item.prefixId}>
                  <td className="border border-gray-700 p-3">{item.prefixFor}</td>
                  <td className="border border-gray-700 p-3">{item.prefix}</td>
                  <td className="border border-gray-700 p-3 text-center">
                    <Button
                      isIcon
                      color="primary"
                      onClick={() => handleEdit(item)}
                      className="size-8 rounded-lg"
                    >
                      <PencilSquareIcon className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}