import React from 'react'
import ChangeTheme from '@/components/ChangeTheme'
import ChangeLang from '@/components/ChangLang'
export default function Header() {
  return (
    <div className='w-full h-[45px] bg-white text-black dark:bg-black dark:text-white flex justify-between px-10 py-2 '>
    <div className='text-2xl font-bold'>Uppeta</div>
    <div className='flex items-center gap-2'>
     <ChangeTheme/>
     <ChangeLang/>
    </div>
    </div>
)
}
