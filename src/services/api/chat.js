const API_URL = '/api/chat/conversaciones/'

export const getChats = async (id) => {
  const response = await fetch(API_URL + 'chatroom/' + id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const responseData = await response.json()
    console.log(responseData)
    return responseData
  } else {
    const error = await response.json()
    console.log(error)
    return error
  }
}

export const getAllConversations = async (_id) => {
  const response = await fetch(API_URL + _id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const responseData = await response.json()
    console.log(responseData)
    return responseData
  } else {
    const error = await response.json()
    console.log(error)
    return error
  }
}

export const getLastMessages = async (_id) => {
  const response = await fetch(`/api/chat/ultimo-mensaje/${_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    const responseData = await response.json()
    console.log(responseData)
    return responseData
  } else {
    const error = await response.json()
    console.log(error)
    return error
  }
}
