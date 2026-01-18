import type { DataTableColumn } from './DataTableColumn';

export type GroupedRecord<T> = {
  type: 'group';
  key: string;
  value: string;
  level: number;
  recordCount: number;
  data: Partial<T>;
  allRecords: T[];
  column: DataTableColumn<T>;
};
export type RowRecord<T> = { type: 'record'; data: T; level: number };
export type TypedRecord<T> = GroupedRecord<T> | RowRecord<T>;
