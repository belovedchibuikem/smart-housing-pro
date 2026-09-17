"use client"

import { Button } from "@/components/ui/button"

export type TablePaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export function TablePagination({
  pagination,
  onPageChange,
  noun = "results",
}: {
  pagination: TablePaginationMeta | null | undefined
  onPageChange: (page: number) => void
  noun?: string
}) {
  if (!pagination || pagination.total <= 0) return null

  const currentPage = Number(pagination.current_page) || 1
  const perPage = Number(pagination.per_page) || 15
  const total = Number(pagination.total) || 0
  const lastPage = Math.max(
    1,
    Number(pagination.last_page) || Math.ceil(total / Math.max(perPage, 1)) || 1,
  )
  const from = (currentPage - 1) * perPage + 1
  const to = Math.min(currentPage * perPage, total)

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {total} {noun}
      </p>
      {lastPage > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}
