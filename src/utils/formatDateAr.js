export const formatDateAR = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  date.setHours(date.getHours() - 3) // Resta 3 horas manualmente
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
