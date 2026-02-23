import { Button } from '@/components/ui/invoice/Common';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Loader2,
    Plus,
    Search,
    Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface ResourceTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading: boolean;
    totalItems: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onSearch: (query: string) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onAdd?: () => void;
    resourceName: string;
}

export function ResourceTable<T extends { id: string }>({
    data,
    columns,
    loading,
    totalItems,
    page,
    limit,
    onPageChange,
    onSearch,
    onEdit,
    onDelete,
    onAdd,
    resourceName
}: ResourceTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, onSearch]);

    const totalPages = Math.ceil(totalItems / limit);

    const containerRef = React.useRef<HTMLTableSectionElement>(null);
    useGSAP(() => {
        if (!loading && data.length > 0) {
            gsap.fromTo(
                ".gsap-table-row",
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
            );
        }
    }, { scope: containerRef, dependencies: [data, loading] });

    return (
        <div className="space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={`Search ${resourceName}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 bg-white dark:bg-slate-900 dark:text-slate-50"
                    />
                </div>
                {onAdd && (
                    <Button onClick={onAdd} icon={Plus}>
                        Add {resourceName}
                    </Button>
                )}
            </div>


            <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                            <Loader2 className="animate-spin mr-2" /> Loading data...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                            <p>No {resourceName.toLowerCase()}s found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                    {(onEdit || onDelete) && <th className="px-6 py-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody ref={containerRef} className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.map((item) => (
                                    <tr key={item.id} className="gsap-table-row hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                                        {columns.map((col, idx) => (
                                            <td key={idx} className={`px-6 py-4 text-sm text-slate-600 dark:text-slate-300 ${col.className || ''}`}>
                                                {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : '-')}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {onEdit && (
                                                        <button 
                                                            onClick={() => onEdit(item)}
                                                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button 
                                                            onClick={() => onDelete(item)}
                                                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>


                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages || loading}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
