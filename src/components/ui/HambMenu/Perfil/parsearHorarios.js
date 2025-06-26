export const parsearHorarios = (horarios) => {
  console.log(horarios)
  let regex = /(?:de\s*)?(\d{2}):(\d{2})\s*-\s*a\s*(\d{2}):(\d{2})/

  let match = horarios.match(regex)
  if (!match) {
    // Si el formato de los horarios no es válido, devolvemos false
    console.error('Formato de horarios invalido')
    return false
  }
  // Extraer los horarios de inicio y fin
  let horaInicio = match[1]
  let minutosInicio = match[2]
  let horaFin = match[3]
  let minutosFin = match[4]
  return [horaInicio + ':' + minutosInicio, horaFin + ':' + minutosFin]
}
