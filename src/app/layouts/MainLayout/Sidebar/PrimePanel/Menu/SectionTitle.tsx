import { NavigationTree } from "@/@types/navigation";

// ----------------------------------------------------------------------

export function SectionTitle({ data }: { data: NavigationTree }) {
  return (
    <div className="mt-4 mb-1 px-2">
      <h3 className="dark:text-dark-50 text-sm font-semibold tracking-wide text-gray-800">
        {data.title}
      </h3>
    </div>
  );
}