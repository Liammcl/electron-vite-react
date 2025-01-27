import React from 'react'
import Camera from '@/components/Cam'
import { useRootStore } from '@/context/rootContext'
export default function About() {
  return (
    <div className="min-h-screen  overflow-y-auto p-4">
    <Camera />
    </div>
  )
}
