import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = () => {
  const socketRef             = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      transports:          ['websocket', 'polling'],  // ← add this
      reconnectionAttempts: 5,                         // ← add this
      reconnectionDelay:    1000,                      // ← add this
    })

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected')
      setConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setConnected(false)
    })

    return () => socketRef.current.disconnect()
  }, [])

  return { socket: socketRef.current, connected }
}

export default useSocket