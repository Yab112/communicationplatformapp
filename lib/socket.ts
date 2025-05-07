import { io as ClientIO } from 'socket.io-client'

export const socket = ClientIO(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
  path: '/api/socket/io',
  addTrailingSlash: false,
})

export const createPost = async (data: {
  content: string
  department: string
  image?: string | null
}) => {
  return new Promise((resolve, reject) => {
    socket.emit('create-post', data, (response: any) => {
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response)
      }
    })
  })
}

export const likePost = async (postId: string) => {
  return new Promise((resolve, reject) => {
    socket.emit('like-post', { postId }, (response: any) => {
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response)
      }
    })
  })
}

export const addComment = async (data: {
  postId: string
  content: string
}) => {
  return new Promise((resolve, reject) => {
    socket.emit('add-comment', data, (response: any) => {
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response)
      }
    })
  })
} 