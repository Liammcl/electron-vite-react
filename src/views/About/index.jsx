import React from 'react'
import Camera from '@/components/Cam'
import ComplaxePhone from '@/components/complaxePhoto'

export default function About() {
  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="mx-auto">
        <Camera />
        <ComplaxePhone />
      </div>
    </div>
  )
}
