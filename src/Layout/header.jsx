import React,{Fragment} from 'react'
import ChangeTheme from '@/components/ChangeTheme'
import ChangeLang from '@/components/ChangLang'
import { useNavigate } from 'react-router-dom'
import SplitText from '@/components/spring/SplitText/SplitText'
import { useLocation } from 'react-router-dom';

export default function Header() {
  const blackList=['/']
const {pathname}=useLocation()
const navigate=useNavigate()

  return (
    <Fragment>
    {!blackList.includes(pathname)?<div className='w-full h-[45px] bg-white text-black dark:bg-black dark:text-white flex justify-between px-10 py-2 '>
      <div className='cursor-pointer' onClick={() => navigate('/')}>
        <SplitText
          text="Uppeta"
          className="text-2xl font-semibold text-center"
          delay={150}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
        />
      </div>
      <div className='flex items-center gap-2'>
        <ChangeTheme />
        <ChangeLang />
      </div>
    </div>:null}
    </Fragment>
  )
}
