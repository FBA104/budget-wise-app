/**
 * use-mobile - detect mobile screen size
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768 // pixels - matches Tailwind's md breakpoint

export function useIsMobile() {
  // track mobile state - undefined initially, then boolean
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // create media query for mobile detection
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // handler function to update mobile state when window resizes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // true if screen is smaller than breakpoint
    }
    
    // listen for window resize events
    mql.addEventListener("change", onChange)
    
    // set initial value based on current window size
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // cleanup event listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, []) // run once on mount

  return !!isMobile // convert to boolean (undefined becomes false)
}
