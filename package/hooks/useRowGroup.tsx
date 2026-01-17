import { useCallback, useMemo, useState } from 'react';
import type { DataTableColumn, DataTableGroupColumn } from '../types/DataTableColumn';
import type { TypedRecord } from '../types/DataTableRowGroupProps';

interface UseRowGroupProps<T> {
  records?: T[];
  columns: DataTableColumn<T>[];
  groupColumn?: DataTableGroupColumn<T>;
}

export function useRowGroup<T>({ columns = [], groupColumn, records }: UseRowGroupProps<T>) {
  const groupingColumns = useMemo(() => columns.filter((col) => col.rowGroup), [columns]);

  const hasGrouping = groupingColumns.length > 0 && !!groupColumn;

  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const groupedRecords = useMemo(() => {
    if (!hasGrouping || !records) return records;
    return buildGroupMap(records, groupingColumns);
  }, [hasGrouping, records, groupingColumns]);

  const mappedRecords = useMemo(() => {
    if (!hasGrouping) {
      if (!records) return undefined;
      return records.map((record) => ({
        type: 'record' as const,
        data: record,
        level: 0,
      }));
    }
    return flattenGroupMapWithAggregation(groupedRecords, columns, collapsedGroups);
  }, [hasGrouping, records, groupedRecords, columns, collapsedGroups]);

  const toggleGroup = useCallback((r?: TypedRecord<T>) => {
    if (r?.type === 'group') {
      setCollapsedGroups((prev) => (prev.includes(r.key) ? prev.filter((g) => g !== r.key) : [...prev, r.key]));
    }
  }, []);

  return { hasGrouping, groupedRecords, collapsedGroups, setCollapsedGroups, mappedRecords, toggleGroup };
}

type GroupValue<T> = T[] | Map<string, GroupValue<T>>;

function buildGroupMap<T>(records: T[], columns: UseRowGroupProps<T>['columns'], level = 0): GroupValue<T> {
  if (level >= columns.length) {
    return records;
  }

  const column = columns[level];
  const map = new Map<string, GroupValue<T>>();

  records.forEach((record) => {
    const value = String(record[column.accessor as keyof T]);
    if (!map.has(value)) {
      map.set(value, []);
    }
    (map.get(value) as T[]).push(record);
  });

  if (level < columns.length - 1) {
    const nestedMap = new Map<string, GroupValue<T>>();
    map.forEach((groupRecords, key) => {
      nestedMap.set(key, buildGroupMap(groupRecords as T[], columns, level + 1));
    });
    return nestedMap;
  }

  return map;
}

function countRecords<T>(value: GroupValue<T>): number {
  if (Array.isArray(value)) {
    return value.length;
  }
  let count = 0;
  value.forEach((v) => {
    count += countRecords(v);
  });
  return count;
}

function getAllRecords<T>(value: GroupValue<T>): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  const allRecords: T[] = [];
  value.forEach((v) => {
    allRecords.push(...getAllRecords(v));
  });
  return allRecords;
}

function createAggregatedRecord<T>(records: T[], columns: UseRowGroupProps<T>['columns']): Partial<T> {
  const aggregated: Partial<T> = {} as Partial<T>;

  columns.forEach((column) => {
    if (column.aggFunc && column.accessor) {
      const values = records.map((record) => record[column.accessor as keyof T]);
      aggregated[column.accessor as keyof T] = column.aggFunc(values) as T[keyof T];
    }
  });

  return aggregated;
}

function flattenGroupMapWithAggregation<T>(
  groupMap: GroupValue<T> | undefined,
  columns: UseRowGroupProps<T>['columns'],
  collapsedGroups: string[],
  level = 0,
  parentKey = ''
): TypedRecord<T>[] | undefined {
  if (!groupMap) return undefined;
  const result: TypedRecord<T>[] = [];

  if (Array.isArray(groupMap)) {
    groupMap.forEach((record) => {
      result.push({ type: 'record', data: record, level: level + 1 });
    });
    return result;
  }

  groupMap.forEach((value, key) => {
    const groupKey = parentKey ? `${parentKey}.${String(key)}` : String(key);
    const allRecords = getAllRecords(value);
    const recordCount = countRecords(value);
    const aggregated = createAggregatedRecord(allRecords, columns);

    result.push({
      type: 'group',
      key: groupKey,
      value: key,
      level,
      recordCount,
      data: aggregated,
      allRecords,
    });

    const isCollapsed = collapsedGroups.includes(groupKey);
    if (!isCollapsed) {
      const nested = flattenGroupMapWithAggregation(value, columns, collapsedGroups, level + 1, groupKey) ?? [];
      result.push(...nested);
    }
  });

  return result;
}
