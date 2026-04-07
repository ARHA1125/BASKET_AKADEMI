"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "transform"
        }
      )
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  )
}
