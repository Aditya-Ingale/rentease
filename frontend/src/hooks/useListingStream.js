import { useEffect } from 'react'

function useListingStream(onNewListing) {
  useEffect(() => {
    const eventSource = new EventSource(
      'http://localhost:8080/api/properties/stream'
    )

    eventSource.addEventListener('new-listing', (event) => {
      try {
        const newListing = JSON.parse(event.data)
        onNewListing(newListing)
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    })

    eventSource.onerror = () => {
      console.warn('SSE connection error — will retry automatically')
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
    }
  }, [])
}

export default useListingStream