export const removeMessagesById = (userId) => {
  try {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || {}
    if (storedMessages[userId]) {
      delete storedMessages[userId]
      localStorage.setItem('messages', JSON.stringify(storedMessages))
      console.log(`Mensajes del usuario con ID ${userId} eliminados.`)
    } else {
      console.log(`No hay mensajes para el usuario con ID ${userId}.`)
    }
  } catch (error) {
    console.error('Error al eliminar mensajes:', error)
  }
}
