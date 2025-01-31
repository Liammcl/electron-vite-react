import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from '@/assets/logo.png'
import SplitText from '@/components/spring/SplitText/SplitText'
export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full p-8">
      <img draggable={false} src={logo} alt=""  className="xl:w-[220px] xl:h-[100px] md:w-[160px] md:h-[60px] w-[80px] h-[30px] object-fill"/>
<div className="flex justify-center items-center flex-col  xl:gap-36  gap-16 h-full w-full ">
  <div className="flex items-center flex-col  justify-center xl:gap-5 md:gap-3  gap-2">
  <SplitText
          text="supper takes photos"
          className="dark:text-white xl:text-8xl select-none  text-3xl md:text-5xl"
          delay={150}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
        />
        <div className="dark:text-white/50 select-none">Powered by uppeta</div>
  </div>
 
      
<Button variant="default" className="xl:px-[100px] xl:py-[40px] xl:text-xl rounded-none  md:px-[80px]  md:py-[35px] md:text-base text-sm px-10 py-6 " onClick={() => navigate("/about")}>
        Start!
      </Button>
</div>
    </div>
  );
}
