"use client";

import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface Option {
    label: string;
    value: string;
    description?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    className = "",
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(query.toLowerCase()))
    );

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                className={`flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-blue-800 ${
                    open ? "ring-2 ring-blue-500/20 border-blue-500" : ""
                }`}
            >
                <span className={`block truncate ${!selectedOption ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                     <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            type="text"
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                         {query && (
                             <button onClick={() => setQuery('')} className="ml-2 text-slate-400 hover:text-slate-600">
                                 <X className="h-4 w-4" />
                             </button>
                         )}
                    </div>
                    
                    <div className="max-h-[200px] overflow-auto p-1 py-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                No results found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                                        value === option.value ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                    }`}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <div className="flex-1">
                                         <div className="font-medium">{option.label}</div>
                                         {option.description && (
                                             <div className="text-xs text-slate-500">{option.description}</div>
                                         )}
                                    </div>
                                    {value === option.value && (
                                        <Check className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
