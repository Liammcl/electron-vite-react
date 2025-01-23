import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
export default function Home() {
  const navigate = useNavigate()
  return (
    <div>
   
<Button variant="outline" onClick={() => navigate('/about')}>跳转about</Button>

    </div>
  )
}
