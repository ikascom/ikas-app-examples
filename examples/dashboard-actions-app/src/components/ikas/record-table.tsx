"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ikas/empty-state"

type RecordTableColumn<T> = {
  id: string
  header: React.ReactNode
  /** Cell renderer. Defaults to `String(row[id])`. */
  cell?: (row: T) => React.ReactNode
  align?: "start" | "end"
  /** Tailwind width class, e.g. "w-32". */
  className?: string
  /** Hide below the md breakpoint. Keep the first column always visible. */
  hideOnMobile?: boolean
  /** Header becomes a sort button. Needs `sort` and `onSortChange` on the table. */
  sortable?: boolean
}

type RecordTableSort = {
  /** Column id. */
  id: string
  direction: "asc" | "desc"
}

type RecordTableProps<T> = {
  columns: RecordTableColumn<T>[]
  rows: T[]
  /** Stable id per row, used for keys and selection. */
  getRowId: (row: T) => string
  /** Accessible name, e.g. "Orders". */
  label: string

  /** Enables checkboxes. Controlled. */
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  /** Rendered in the header row while rows are selected. Receives selected ids. */
  bulkActions?: (selectedIds: string[]) => React.ReactNode

  /** Makes rows clickable, usually to open the record. */
  onRowClick?: (row: T) => void
  /** Shows skeleton rows and disables selection and paging. */
  loading?: boolean
  /** Shown when `rows` is empty and not loading. Usually an EmptyState size="section". */
  emptyState?: React.ReactNode
  /**
   * The rows failed to load: replaces them with a danger EmptyState. `true` uses the
   * default message; a string or node becomes its description. `loading` wins while set.
   */
  error?: React.ReactNode
  /** Adds "Tekrar dene" to the error state. Set `loading` while the retry runs. */
  onRetry?: () => void
  /** Current sort. The table only shows it; sort `rows` yourself (or on the server). */
  sort?: RecordTableSort
  /** Called when a sortable header is clicked: ascending, then descending, then off. */
  onSortChange?: (sort: RecordTableSort | undefined) => void
  /** Search, filters, tabs. Rendered above the table inside the same card. */
  toolbar?: React.ReactNode
  /** Prev/next footer, shown when there is more than one page. */
  pagination?: {
    page: number
    pageCount: number
    onPageChange: (page: number) => void
    /** e.g. "1–20 of 134" */
    summary?: React.ReactNode
  }
  className?: string
}

/** List of records in a card: selection, bulk actions, paging, empty and error states. */
function RecordTable<T>({
  columns,
  rows,
  getRowId,
  label,
  selectedIds,
  onSelectedIdsChange,
  bulkActions,
  onRowClick,
  loading = false,
  emptyState,
  error,
  onRetry,
  sort,
  onSortChange,
  toolbar,
  pagination,
  className,
}: RecordTableProps<T>) {
  const failed = !loading && Boolean(error)
  const selectable = Boolean(selectedIds && onSelectedIdsChange)
  const selected = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const pageIds = rows.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && !allSelected
  const showBulk = selectable && selected.size > 0 && Boolean(bulkActions)
  const colSpan = columns.length + (selectable ? 1 : 0)

  function cycleSort(id: string) {
    if (!onSortChange) return
    if (sort?.id !== id) onSortChange({ id, direction: "asc" })
    else if (sort.direction === "asc") onSortChange({ id, direction: "desc" })
    else onSortChange(undefined)
  }

  function toggleAll(checked: boolean) {
    if (!onSelectedIdsChange) return
    const next = new Set(selected)
    for (const id of pageIds) {
      if (checked) next.add(id)
      else next.delete(id)
    }
    onSelectedIdsChange([...next])
  }

  function toggleOne(id: string, checked: boolean) {
    if (!onSelectedIdsChange) return
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectedIdsChange([...next])
  }

  return (
    <div
      data-slot="record-table"
      className={cn("overflow-hidden rounded-xl bg-card shadow-card", className)}
    >
      {toolbar && (
        <div data-slot="record-table-toolbar" className="flex flex-wrap items-center gap-2 border-b p-3">
          {toolbar}
        </div>
      )}
      <Table aria-label={label} aria-busy={loading || undefined}>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10 pr-0 pl-4">
                <Checkbox
                  aria-label="Bu sayfadaki tüm satırları seç"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  disabled={loading || failed || rows.length === 0}
                />
              </TableHead>
            )}
            {showBulk ? (
              <TableHead colSpan={columns.length} className="py-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-foreground">{selected.size} seçildi</span>
                  <div className="flex items-center gap-1.5">{bulkActions?.([...selected])}</div>
                </div>
              </TableHead>
            ) : (
              columns.map((column, index) => {
                const sortable = column.sortable && onSortChange
                const direction = sort?.id === column.id ? sort.direction : undefined
                const SortIcon = direction === "asc" ? ArrowUpIcon : direction === "desc" ? ArrowDownIcon : ArrowUpDownIcon
                return (
                  <TableHead
                    key={column.id}
                    aria-sort={sortable ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}
                    className={cn(
                      column.align === "end" && "text-right",
                      column.hideOnMobile && "hidden md:table-cell",
                      index === 0 && !selectable && "pl-4",
                      index === columns.length - 1 && "pr-4",
                      column.className
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(column.id)}
                        disabled={loading || failed}
                        className={cn(
                          "group/sort -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 font-medium outline-none hover:bg-foreground/[0.05] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none",
                          column.align === "end" && "flex-row-reverse",
                          direction && "text-foreground"
                        )}
                      >
                        {column.header}
                        <SortIcon
                          aria-hidden
                          className={cn("size-3.5 shrink-0", direction ? "text-foreground" : "text-icon opacity-0 transition-opacity group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100")}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })
            )}
          </TableRow>
        </TableHeader>
        <TableBody key={loading ? "loading" : failed ? "error" : "rows"} className="animate-in duration-200 ease-(--ease-out) fade-in-0 motion-reduce:animate-none">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {selectable && (
                  <TableCell className="pl-4">
                    <Skeleton className="size-4 rounded-[4px]" />
                  </TableCell>
                )}
                {columns.map((column, index) => (
                  <TableCell
                    key={column.id}
                    className={cn(column.hideOnMobile && "hidden md:table-cell", index === 0 && !selectable && "pl-4")}
                  >
                    <Skeleton className={cn("h-4", index === 0 ? "w-32" : "w-16", column.align === "end" && "ml-auto")} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : failed ? (
            <TableRow data-slot="record-table-error" className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0 whitespace-normal">
                <EmptyState
                  status="danger"
                  title="Kayıtlar yüklenemedi"
                  description={error === true ? "Bağlantınızı kontrol edip tekrar deneyin." : error}
                  onRetry={onRetry}
                />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0 whitespace-normal">
                {emptyState ?? <p className="px-4 py-10 text-center text-sm text-muted-foreground">Sonuç yok</p>}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)
              return (
                <TableRow
                  key={id}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer", "data-[state=selected]:bg-muted")}
                >
                  {selectable && (
                    <TableCell className="w-10 pr-0 pl-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label="Satırı seç"
                        checked={isSelected}
                        onCheckedChange={(value) => toggleOne(id, value === true)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, index) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.align === "end" && "text-right tabular-nums",
                        column.hideOnMobile && "hidden md:table-cell",
                        index === 0 && !selectable && "pl-4",
                        index === columns.length - 1 && "pr-4",
                        column.className
                      )}
                    >
                      {column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.id] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {pagination && pagination.pageCount > 1 && !failed && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
          <p className="text-[13px] text-muted-foreground tabular-nums">
            {pagination.summary ?? `Sayfa ${pagination.page} / ${pagination.pageCount}`}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Önceki sayfa"
              disabled={loading || pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Sonraki sayfa"
              disabled={loading || pagination.page >= pagination.pageCount}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { RecordTable, type RecordTableSort, type RecordTableColumn, type RecordTableProps }
