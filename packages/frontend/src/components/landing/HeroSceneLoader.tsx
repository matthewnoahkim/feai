'use client'

import dynamic from 'next/dynamic'

// WebGL can't server-render; load the scene on the client only.
const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <div className="hero-canvas-loading" aria-hidden />,
})

export default function HeroSceneLoader() {
  return <HeroScene />
}
