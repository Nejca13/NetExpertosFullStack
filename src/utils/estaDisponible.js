export const estaDisponible = (horarios) => {
  let horaActual = new Date()
  let hora = horaActual.getHours()
  let minutos = horaActual.getMinutes()
  let horaActualEnMinutos = hora * 60 + minutos

  // Expresión regular para extraer los horarios de inicio y fin
  let regex = /(\d{2}):(\d{2}) - a (\d{2}):(\d{2})/
  let match = horarios.match(regex)

  if (!match) {
    // Si el formato de los horarios no es válido, devolvemos false
    console.error('Formato de horarios invalido')
    return false
  }

  // Extraer los horarios de inicio y fin
  let horaInicio = parseInt(match[1])
  let minutosInicio = parseInt(match[2])
  let horaFin = parseInt(match[3])
  let minutosFin = parseInt(match[4])

  // Convertir horarios a minutos
  let horaInicioEnMinutos = horaInicio * 60 + minutosInicio
  let horaFinEnMinutos = horaFin * 60 + minutosFin

  // Verificar si la hora actual está entre los horarios de inicio y fin
  if (
    (horaInicioEnMinutos <= horaActualEnMinutos &&
      horaActualEnMinutos <= horaFinEnMinutos) ||
    (horaInicioEnMinutos >= horaFinEnMinutos &&
      (horaActualEnMinutos >= horaInicioEnMinutos ||
        horaActualEnMinutos <= horaFinEnMinutos))
  ) {
    return true
  } else {
    return false
  }
}
