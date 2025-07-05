'use client'

import { getReviewsProfesional } from '@/services/api/reviews'
import { useEffect, useState, useCallback } from 'react'

export const useReviewsProfesional = (id_profesional) => {
  const defaultFilters = {
    page: 1,
    limit: 2,
    ordenar_por: 'fecha_creacion',
    orden: 'desc',
  }

  const [filters, setFilters] = useState(defaultFilters)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!id_profesional) return

    setLoading(true)
    setError(null)

    const result = await getReviewsProfesional({
      id_profesional,
      ...filters,
    })

    if (result.success) {
      setData(result.data)
    } else {
      setError(result.error)
    }

    setLoading(false)
  }, [id_profesional, filters])

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
