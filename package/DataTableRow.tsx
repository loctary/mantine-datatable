import type { CheckboxProps, MantineColor, MantineStyleProp, MantineTheme } from '@mantine/core';
import { TableTr } from '@mantine/core';
import clsx from 'clsx';
import { DataTableRowCell } from './DataTableRowCell';
import { DataTableRowExpansion } from './DataTableRowExpansion';
import { DataTableRowSelectorCell } from './DataTableRowSelectorCell';
import { getRowCssVariables } from './cssVariables';
import type { useRowExpansion } from './hooks';
import type {
  DataTableCellClickHandler,
  DataTableColumn,
  DataTableGroupColumn,
  DataTableDefaultColumnProps,
  DataTableProps,
  DataTableRowClickHandler,
  DataTableSelectionTrigger,
  TypedRecord,
} from './types';
import { CONTEXT_MENU_CURSOR, POINTER_CURSOR } from './utilityClasses';

type DataTableRowProps<T> = {
  record: T;
  index: number;
  columns: DataTableColumn<T>[];
  defaultColumnProps: DataTableDefaultColumnProps<T> | undefined;
  defaultColumnRender:
    | ((record: T, index: number, accessor: keyof T | (string & NonNullable<unknown>)) => React.ReactNode)
    | undefined;
  selectionTrigger: DataTableSelectionTrigger;
  selectionVisible: boolean;
  selectionChecked: boolean;
  selectionIndeterminate: boolean;
  onSelectionChange: React.MouseEventHandler | undefined;
  isRecordSelectable: ((record: T, index: number) => boolean) | undefined;
  selectionCheckboxProps: CheckboxProps | undefined;
  getSelectionCheckboxProps: (record: T, index: number) => CheckboxProps;
  onClick: DataTableRowClickHandler<T> | undefined;
  onDoubleClick: DataTableRowClickHandler<T> | undefined;
  onContextMenu: DataTableRowClickHandler<T> | undefined;
  onCellClick: DataTableCellClickHandler<T> | undefined;
  onCellDoubleClick: DataTableCellClickHandler<T> | undefined;
  onCellContextMenu: DataTableCellClickHandler<T> | undefined;
  expansion: ReturnType<typeof useRowExpansion<T>>;
  customAttributes?: (record: T, index: number) => Record<string, unknown>;
  color:
    | ((record: T, index: number) => MantineColor | undefined | { light: MantineColor; dark: MantineColor })
    | undefined;
  backgroundColor:
    | ((record: T, index: number) => MantineColor | undefined | { light: MantineColor; dark: MantineColor })
    | undefined;
  className?: string | ((record: T, index: number) => string | undefined);
  style?: (record: T, index: number) => MantineStyleProp | undefined;
  selectorCellShadowVisible: boolean;
  selectionColumnClassName: string | undefined;
  selectionColumnStyle: MantineStyleProp | undefined;
  idAccessor: string;
  groupColumn?: DataTableGroupColumn<T>;
  toggleGroupColumn?: (r?: TypedRecord<T>) => void;
  isGroupColumnCollapsed?: boolean;
  typedRecord?: TypedRecord<T>;
} & Pick<DataTableProps<T>, 'rowFactory'>;

export function DataTableRow<T>({
  record,
  index,
  columns,
  defaultColumnProps,
  defaultColumnRender,
  selectionTrigger,
  selectionVisible,
  selectionChecked,
  selectionIndeterminate,
  onSelectionChange,
  isRecordSelectable,
  selectionCheckboxProps,
  getSelectionCheckboxProps,
  onClick,
  onDoubleClick,
  onContextMenu,
  onCellClick,
  onCellDoubleClick,
  onCellContextMenu,
  expansion,
  customAttributes,
  color,
  backgroundColor,
  className,
  style,
  selectorCellShadowVisible,
  selectionColumnClassName,
  selectionColumnStyle,
  rowFactory,
  groupColumn,
  toggleGroupColumn,
  isGroupColumnCollapsed,
  typedRecord,
}: Readonly<DataTableRowProps<T>>) {
  const cols = (
    <>
      {selectionVisible && (
        <DataTableRowSelectorCell<T>
          className={selectionColumnClassName}
          style={selectionColumnStyle}
          record={record as T}
          index={index}
          trigger={selectionTrigger}
          withRightShadow={selectorCellShadowVisible}
          checked={selectionChecked}
          indeterminate={selectionIndeterminate}
          disabled={!onSelectionChange || (isRecordSelectable ? !isRecordSelectable(record as T, index) : false)}
          onChange={onSelectionChange}
          checkboxProps={selectionCheckboxProps}
          getCheckboxProps={getSelectionCheckboxProps}
        />
      )}

      {!!groupColumn && (
        <DataTableRowCell<T>
          key="group-column"
          className={
            typeof groupColumn?.cellsClassName === 'function'
              ? groupColumn.cellsClassName(record, index)
              : groupColumn?.cellsClassName
          }
          style={groupColumn?.cellsStyle?.(record, index)}
          visibleMediaQuery={groupColumn?.visibleMediaQuery}
          record={record as T}
          index={index}
          onClick={undefined}
          onDoubleClick={undefined}
          onContextMenu={undefined}
          accessor={groupColumn?.accessor || ''}
          textAlign={groupColumn?.textAlign}
          noWrap={groupColumn?.noWrap}
          ellipsis={groupColumn?.ellipsis}
          width={groupColumn?.width}
          render={groupColumn?.render}
          defaultRender={defaultColumnRender}
          customCellAttributes={groupColumn?.customCellAttributes}
          toggleGroupColumn={toggleGroupColumn}
          isGroupColumnCollapsed={isGroupColumnCollapsed}
          typedRecord={typedRecord}
          groupColumn={groupColumn}
        />
      )}

      {columns.map((column, columnIndex) => {
        const { hidden, hiddenContent, ...columnProps } = column;
        if (hidden || hiddenContent) return null;

        const {
          accessor,
          visibleMediaQuery,
          textAlign,
          noWrap,
          ellipsis,
          width,
          render,
          cellsClassName,
          cellsStyle,
          customCellAttributes,
        } = { ...defaultColumnProps, ...columnProps };

        return (
          <DataTableRowCell<T>
            key={accessor as React.Key}
            className={typeof cellsClassName === 'function' ? cellsClassName(record, index) : cellsClassName}
            style={cellsStyle?.(record, index)}
            visibleMediaQuery={visibleMediaQuery}
            record={record}
            index={index}
            onClick={
              onCellClick
                ? (event) => onCellClick({ event, record, index, column: columnProps, columnIndex })
                : undefined
            }
            onDoubleClick={
              onCellDoubleClick
                ? (event) => onCellDoubleClick({ event, record, index, column: columnProps, columnIndex })
                : undefined
            }
            onContextMenu={
              onCellContextMenu
                ? (event) => onCellContextMenu({ event, record, index, column: columnProps, columnIndex })
                : undefined
            }
            accessor={accessor}
            textAlign={textAlign}
            noWrap={noWrap}
            ellipsis={ellipsis}
            width={width}
            render={render}
            defaultRender={defaultColumnRender}
            customCellAttributes={customCellAttributes}
            typedRecord={typedRecord}
          />
        );
      })}
    </>
  );

  const expandedElement = expansion && (
    <DataTableRowExpansion
      colSpan={columns.filter(({ hidden }) => !hidden).length + (selectionVisible ? 1 : 0) + (groupColumn ? 1 : 0)}
      open={expansion.isRowExpanded(record)}
      content={expansion.content({ record, index })}
      collapseProps={expansion.collapseProps}
    />
  );

  const rowProps = getRowProps({
    record,
    index,
    selectionChecked,
    onClick,
    onDoubleClick,
    onContextMenu,
    expansion,
    customAttributes,
    color,
    backgroundColor,
    className,
    style,
  });

  if (rowFactory) {
    return rowFactory({
      record,
      index,
      rowProps,
      children: cols,
      expandedElement,
    });
  }

  return (
    <>
      <TableTr {...rowProps}>{cols}</TableTr>
      {expandedElement}
    </>
  );
}

type GetRowPropsArgs<T> = Readonly<
  Pick<
    DataTableRowProps<T>,
    | 'record'
    | 'index'
    | 'selectionChecked'
    | 'onClick'
    | 'onDoubleClick'
    | 'onContextMenu'
    | 'expansion'
    | 'customAttributes'
    | 'color'
    | 'backgroundColor'
    | 'className'
    | 'style'
  >
>;

export function getRowProps<T>({
  record,
  index,
  selectionChecked,
  onClick,
  onDoubleClick,
  onContextMenu,
  expansion,
  customAttributes,
  color,
  backgroundColor,
  className,
  style,
}: GetRowPropsArgs<T>) {
  return {
    className: clsx(
      'mantine-datatable-row',
      {
        [POINTER_CURSOR]:
          onClick || onDoubleClick || (expansion?.isExpandable({ record, index }) && expansion?.expandOnClick),
      },
      { [CONTEXT_MENU_CURSOR]: onContextMenu },
      typeof className === 'function' ? className(record, index) : className
    ),

    ['data-selected']: selectionChecked || undefined,

    onClick: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (expansion) {
        const { isExpandable, isRowExpanded, expandOnClick, expandRow, collapseRow } = expansion;
        if (isExpandable({ record, index }) && expandOnClick) {
          if (isRowExpanded(record)) {
            collapseRow(record);
          } else {
            expandRow(record);
          }
        }
      }
      onClick?.({ event: e, record, index });
    },
    onDoubleClick: onDoubleClick
      ? (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => onDoubleClick({ event: e, record, index })
      : undefined,
    onContextMenu: onContextMenu
      ? (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => onContextMenu({ event: e, record, index })
      : undefined,
    style: [
      color || backgroundColor
        ? (theme: MantineTheme) => {
            const colorValue = color?.(record, index);
            const backgroundColorValue = backgroundColor?.(record, index);
            return getRowCssVariables({ theme, color: colorValue, backgroundColor: backgroundColorValue });
          }
        : undefined,
      style?.(record, index),
    ],
    ...(customAttributes?.(record, index) ?? {}),
  };
}
