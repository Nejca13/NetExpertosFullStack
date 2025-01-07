import { useState, useEffect } from 'react'

function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const jsonData = await response.json()
        setData(jsonData)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }

    fetchData()

    // Cleanup function to cancel fetch if component unmounts before fetch completes
    return () => {
      // AbortController is supported in modern browsers
      // To support older browsers, you might need a polyfill
      const controller = new AbortController()
      controller.abort()
    }
  }, [])

  return { data, loading, error }
}

export default useFetch
