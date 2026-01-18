import { TableTd, type MantineStyleProp, ActionIcon, Flex } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import clsx from 'clsx';
import { useMediaQueryStringOrFunction } from './hooks';
import type { DataTableColumn, DataTableGroupColumn, GroupedRecord, TypedRecord } from './types';
import {
  CONTEXT_MENU_CURSOR,
  ELLIPSIS,
  NOWRAP,
  POINTER_CURSOR,
  TEXT_ALIGN_CENTER,
  TEXT_ALIGN_LEFT,
  TEXT_ALIGN_RIGHT,
} from './utilityClasses';
import { getValueAtPath } from './utils';

type DataTableRowCellProps<T> = {
  className: string | undefined;
  style: MantineStyleProp | undefined;
  record: T;
  index: number;
  defaultRender:
    | ((record: T, index: number, accessor: keyof T | (string & NonNullable<unknown>)) => React.ReactNode)
    | undefined;
  onClick: React.MouseEventHandler<HTMLTableCellElement> | undefined;
  onDoubleClick: React.MouseEventHandler<HTMLTableCellElement> | undefined;
  onContextMenu: React.MouseEventHandler<HTMLTableCellElement> | undefined;
  groupColumn?: DataTableGroupColumn<T>;
  toggleGroupColumn?: (r?: TypedRecord<T>) => void;
  isGroupColumnCollapsed?: boolean;
  typedRecord?: TypedRecord<T>;
} & Pick<
  DataTableColumn<T>,
  'accessor' | 'visibleMediaQuery' | 'textAlign' | 'width' | 'noWrap' | 'ellipsis' | 'render' | 'customCellAttributes'
>;

export function DataTableRowCell<T>({
  className,
  style,
  visibleMediaQuery,
  record,
  index,
  onClick,
  onDoubleClick,
  onContextMenu,
  noWrap,
  ellipsis,
  textAlign,
  width,
  accessor,
  render,
  defaultRender,
  customCellAttributes,
  toggleGroupColumn,
  isGroupColumnCollapsed,
  typedRecord,
  groupColumn,
}: DataTableRowCellProps<T>) {
  if (!useMediaQueryStringOrFunction(visibleMediaQuery)) return null;
  return (
    <TableTd
      className={clsx(
        {
          [NOWRAP]: noWrap || ellipsis,
          [ELLIPSIS]: ellipsis,
          [POINTER_CURSOR]: onClick || onDoubleClick,
          [CONTEXT_MENU_CURSOR]: onContextMenu,
          [TEXT_ALIGN_LEFT]: textAlign === 'left',
          [TEXT_ALIGN_CENTER]: textAlign === 'center',
          [TEXT_ALIGN_RIGHT]: textAlign === 'right',
        },
        className
      )}
      style={[
        {
          width,
          minWidth: width,
          maxWidth: width,
          ...(!!groupColumn && {
            paddingInlineStart: `calc(var(--mantine-spacing-xs) + var(--mantine-spacing-lg) * ${typedRecord?.level ?? 1})`,
          }),
        },
        style,
      ]}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      {...customCellAttributes?.(record, index)}
    >
      <Flex gap="xs" align="center" w="100%" h="100%">
        {!!groupColumn &&
          (typedRecord?.type === 'group' ? (
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => toggleGroupColumn?.(typedRecord)}
              aria-label={isGroupColumnCollapsed ? 'Expand group' : 'Collapse group'}
            >
              {isGroupColumnCollapsed ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          ) : (
            <div style={{ marginInlineEnd: 'var(--ai-size-sm)' }} />
          ))}
        {!!groupColumn &&
          typedRecord?.type === 'group' &&
          (groupColumn?.rowGroupRender?.(typedRecord as GroupedRecord<T>) ??
            `${typedRecord.value} (${typedRecord.recordCount})`)}
        {(typedRecord?.type === 'record' || (typedRecord?.type === 'group' && !groupColumn)) &&
          (render
            ? render(record, index)
            : defaultRender
              ? defaultRender(record, index, accessor)
              : (getValueAtPath(record, accessor) as React.ReactNode))}
      </Flex>
    </TableTd>
  );
}
