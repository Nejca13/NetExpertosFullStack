const API_URL = '/api/chat/conversaciones/'

export const getChats = async (id1, id2) => {
  const response = await fetch(API_URL + id1 + '/' + id2, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    const responseData = await response.json()

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

    return responseData
  } else {
    const error = await response.json()
    console.log(error)
    return error
  }
}
