// components/shared/form/MultiSelect.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export interface MultiSelectOption {
  id: string;
  name: string;
}

interface MultiSelectProps {
  data: MultiSelectOption[];
  displayField?: keyof MultiSelectOption;
  value?: MultiSelectOption[];
  onChange?: (selected: MultiSelectOption[]) => void;
  placeholder?: string;
  searchFields?: string[];
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  data,
  displayField = "name",
  value = [],
  onChange,
  placeholder = "Select options...",
  searchFields = ["name"],
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedOptions(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (option: MultiSelectOption) => {
    const isSelected = selectedOptions.some((item) => item.id === option.id);
    let newSelected: MultiSelectOption[];
    
    if (isSelected) {
      newSelected = selectedOptions.filter((item) => item.id !== option.id);
    } else {
      newSelected = [...selectedOptions, option];
    }
    
    setSelectedOptions(newSelected);
    onChange?.(newSelected);
  };

  const handleRemove = (optionId: string) => {
    const newSelected = selectedOptions.filter((item) => item.id !== optionId);
    setSelectedOptions(newSelected);
    onChange?.(newSelected);
  };

  const handleSelectAll = () => {
    const filteredOptions = getFilteredOptions();
    const allSelected = filteredOptions.every((opt) =>
      selectedOptions.some((item) => item.id === opt.id)
    );
    
    let newSelected: MultiSelectOption[];
    if (allSelected) {
      const filteredIds = new Set(filteredOptions.map((opt) => opt.id));
      newSelected = selectedOptions.filter((item) => !filteredIds.has(item.id));
    } else {
      const existingIds = new Set(selectedOptions.map((item) => item.id));
      const toAdd = filteredOptions.filter((opt) => !existingIds.has(opt.id));
      newSelected = [...selectedOptions, ...toAdd];
    }
    
    setSelectedOptions(newSelected);
    onChange?.(newSelected);
  };

  const getFilteredOptions = () => {
    if (!searchTerm.trim()) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) => {
      const searchable = searchFields?.map((field) => 
        String(item[field as keyof MultiSelectOption] || "").toLowerCase()
      ) || [];
      return searchable.some((text) => text.includes(lowerSearch));
    });
  };

  const filteredOptions = getFilteredOptions();
  const isAllFilteredSelected = filteredOptions.length > 0 &&
    filteredOptions.every((opt) =>
      selectedOptions.some((item) => item.id === opt.id)
    );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        onClick={toggleDropdown}
        className="flex min-h-[42px] w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-dark-400"
      >
        <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
              >
                {String(option[displayField])}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(option.id);
                  }}
                  className="rounded-full p-0.5 hover:bg-primary-200 dark:hover:bg-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-dark-500 dark:bg-dark-800">
          <div className="border-b border-gray-200 p-2 dark:border-dark-500">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-700 dark:text-gray-200"
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    isAllFilteredSelected
                      ? "border-primary-500 bg-primary-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isAllFilteredSelected && (
                    <CheckIcon className="h-3 w-3 text-white" />
                  )}
                </div>
                <span>Select All</span>
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.some(
                  (item) => item.id === option.id
                );
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span>{String(option[displayField])}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-dark-500 dark:text-gray-400">
            {selectedOptions.length} item{selectedOptions.length !== 1 ? "s" : ""} selected
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;