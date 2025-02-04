import React,{Fragment} from 'react'
import ChangeTheme from '@/components/ChangeTheme'
import ChangeLang from '@/components/ChangLang'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import LogoWarp from '@/utils/logoWarp'
export default function Header() {
const {pathname}=useLocation()
const navigate=useNavigate()

  return (
    <Fragment>
    <div className='w-full h-auto bg-white text-black dark:bg-black dark:text-white flex justify-between px-10 py-2 '>
      <div className='cursor-pointer' onClick={() => navigate('/')}>
    <LogoWarp/>
      </div>
      <div className='flex items-center gap-2'>
        <ChangeTheme />
        <ChangeLang />
      </div>
    </div>
    </Fragment>
  )
}
