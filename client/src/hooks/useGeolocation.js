// src/hooks/useGeolocation.js

import { useState, useEffect, useRef } from 'react'

const useGeolocation = (isTracking) => {
  const [location, setLocation]   = useState(null)
  const [error,    setError]       = useState(null)
  const watchIdRef                 = useRef(null)

  useEffect(() => {
    if (!isTracking) {
      // Stop watching when tracking is off
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
        setError(null)
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isTracking])

  return { location, error }
}

export default useGeolocation