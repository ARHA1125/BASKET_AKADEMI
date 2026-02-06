import { Skeleton } from '@/components/Skeleton';

/**
 * Skeleton loader for table rows
 * @param columns - Number of columns to render
 * @param rows - Number of skeleton rows to display
 */
export function TableRowSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                            {colIndex === 0 ? (
                                // First column with avatar + name
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                            ) : colIndex === columns - 1 ? (
                                // Last column (actions)
                                <div className="flex items-center justify-end gap-2">
                                    <Skeleton className="w-8 h-8 rounded-md" />
                                    <Skeleton className="w-8 h-8 rounded-md" />
                                </div>
                            ) : (
                                // Middle columns
                                <Skeleton className="h-4 w-24" />
                            )}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

/**
 * Skeleton loader for stats/metric cards
 */
export function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>
        </div>
    );
}

/**
 * Skeleton loader for profile/info cards
 */
export function ProfileCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    );
}
