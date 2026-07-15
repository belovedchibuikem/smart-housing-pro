"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  fetchMarketplaceListings,
  type MarketplaceFilters,
  type MarketplaceListing,
} from "@/lib/api/marketplace"

type Pagination = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const emptyPagination: Pagination = {
  current_page: 1,
  last_page: 1,
  per_page: 24,
  total: 0,
}

type FiltersWithoutPage = Omit<MarketplaceFilters, "page">

/**
 * Debounced marketplace listings with infinite-scroll append.
 */
export function useMarketplaceListings(filters: FiltersWithoutPage, debounceMs = 300) {
  const [page, setPage] = useState(1)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [pagination, setPagination] = useState<Pagination>(emptyPagination)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)
  const filtersKey = JSON.stringify(filters)

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    setListings([])
  }, [filtersKey])

  useEffect(() => {
    const id = ++requestId.current
    const handle = setTimeout(() => {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)
      setError(null)
      fetchMarketplaceListings({ ...filters, page, per_page: filters.per_page ?? 24 })
        .then((result) => {
          if (id !== requestId.current) return
          setListings((prev) => (page > 1 ? [...prev, ...result.data] : result.data))
          setPagination(result.pagination)
        })
        .catch(() => {
          if (id !== requestId.current) return
          setError("Could not load listings")
        })
        .finally(() => {
          if (id !== requestId.current) return
          setLoading(false)
          setLoadingMore(false)
        })
    }, debounceMs)
    return () => clearTimeout(handle)
  }, [filters, filtersKey, page, debounceMs])

  const hasMore = pagination.current_page < pagination.last_page

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore) return
    setPage((p) => p + 1)
  }, [hasMore, loading, loadingMore])

  return {
    listings,
    pagination,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    page,
    setPage,
  }
}
