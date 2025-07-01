'use client'
import { getClientesDashboard } from '@/services/api/clientes'
import { useEffect, useState, useCallback } from 'react'

export const useClientesDashboard = () => {
  const defaultFilters = {
    page: 1,
    limit: 25,
    sort_type: 'desc',
    query: '',
    from_date: null,
    to_date: null,
  }

  const [filters, setFilters] = useState(defaultFilters)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await getClientesDashboard(filters)

    if (result.success) {
      setData(result.data)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchData,
  }
}
