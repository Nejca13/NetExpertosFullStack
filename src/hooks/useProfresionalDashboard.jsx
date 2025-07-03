'use client'
import { getProfesionalesDashboard } from '@/services/api/profesionales'
import { useEffect, useState, useCallback } from 'react'

export const useProfesionalesDashboard = () => {
  const defaultFilters = {
    page: 1,
    limit: 25,
    sort_type: 'desc',
    query: '',
    numero: null,
    rubro_nombre: null,
    profesion_nombre: null,
    ubicacion: null,
    plus: null,
    min_calificacion: null,
    max_calificacion: null,
    min_recomendaciones: null,
    max_recomendaciones: null,
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

    const result = await getProfesionalesDashboard(filters)

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
