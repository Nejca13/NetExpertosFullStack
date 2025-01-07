let dbInstance = null // Variable para almacenar la instancia de la base de datos

export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance) // Si la conexión ya está abierta, devuelve la instancia existente
      return
    }

    const request = indexedDB.open('UserDataDB', 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const objectStore = db.createObjectStore('users', {
        keyPath: '_id',
        autoIncrement: true,
      })
      objectStore.createIndex('_id', 'user_data._id')
    }
    console.log('Abriendo conexion con la IndexedDB')
    request.onsuccess = (event) => {
      dbInstance = event.target.result
      resolve(dbInstance)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

export const addUser = async (userData) => {
  const db = await openDatabase()
  const transaction = await db.transaction(['users'], 'readwrite')
  const objectStore = await transaction.objectStore('users')
  const request = objectStore.put(userData)

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const getUser = async (id) => {
  const db = await openDatabase()
  const transaction = db.transaction(['users'], 'readonly')
  const objectStore = transaction.objectStore('users')
  const index = objectStore.index('_id')
  const request = index.get(id)

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        resolve(cursor) // Retorna el valor del primer objeto encontrado
      } else {
        resolve(null) // Retorna null si no se encontró ningún objeto
      }
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const clearUsers = async () => {
  console.log('Borrando todos los usuarios en la IndexedDB')

  try {
    const db = await openDatabase()
    const transaction = db.transaction(['users'], 'readwrite')
    const objectStore = transaction.objectStore('users')
    const clearRequest = objectStore.clear()

    return new Promise((resolve, reject) => {
      clearRequest.onsuccess = () => {
        console.log('Todos los usuarios borrados con éxito')
        resolve()
      }

      clearRequest.onerror = () => {
        console.error('Error al borrar los usuarios:', clearRequest.error)
        reject(clearRequest.error)
      }
    })
  } catch (error) {
    console.error('Error al abrir la base de datos:', error)
    throw error
  }
}

export const updateUser = async (updatedUserData, id) => {
  console.log('update user')
  const db = await openDatabase()
  const transaction = db.transaction(['users'], 'readwrite')
  const objectStore = transaction.objectStore('users')
  const index = objectStore.index('_id')
  const requestGet = index.get(id)

  return new Promise((resolve, reject) => {
    requestGet.onsuccess = (event) => {
      const userData = event.target.result
      if (userData) {
        // Actualizar los datos del usuario
        Object.assign(userData.user_data, updatedUserData) // Fusiona los datos actualizados con los existentes

        // Guardar los datos actualizados en la base de datos
        const requestUpdate = objectStore.put(userData) // Usar objectStore.put para actualizar el objeto

        requestUpdate.onsuccess = () => {
          resolve(userData) // Retorna los datos actualizados
        }

        requestUpdate.onerror = () => {
          reject(requestUpdate.error)
        }
      } else {
        // Si no se encontró el usuario
        resolve(null) // Puedes manejar esto de acuerdo a tus necesidades
      }
    }

    requestGet.onerror = () => {
      reject(requestGet.error)
    }
  })
}

export const getFirstUser = async () => {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('users', 'readonly')
    const objectStore = transaction.objectStore('users')
    const request = objectStore.openCursor()

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        resolve(cursor.value) // Devuelve el primer objeto encontrado
      } else {
        resolve(null) // No hay objetos en el ObjectStore
      }
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}
