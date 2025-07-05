export const formatDateShort = (dateString) => {
  if (!dateString) return null

  const date = new Date(dateString)
  date.setHours(date.getHours() - 3) // Ajuste manual a hora de Argentina (UTC-3)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', // Ej: "Jun"
    day: '2-digit', // Ej: "14"
  })
}
