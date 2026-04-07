export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface Stats {
  spd: number;
  dri: number;
  sho: number;
  def: number;
  pas: number;
  phy: number;
}
