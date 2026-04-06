export interface PaginatedResponseStats {
    total?: number;
    pending?: number;
    active?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    stats?: PaginatedResponseStats;
}
