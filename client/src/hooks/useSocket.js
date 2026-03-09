// src/hooks/useSocket.js

import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = () => {
  const socketRef           = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to backend
    socketRef.current = io(import.meta.env.VITE_API_URL)

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id)
      setConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setConnected(false)
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  return { socket: socketRef.current, connected }
}

export default useSocket