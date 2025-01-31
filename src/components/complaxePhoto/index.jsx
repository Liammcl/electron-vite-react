import {useRef,useEffect,useState} from 'react'
import {ImageFrameComposer}from '@/utils/ImageFrameComposer'
import { Button,message } from 'antd'
import { useRootStore } from '@/context/rootContext'
// 修改图片导入方式
const FrameImg1 = new URL('@/assets/frame1.png', import.meta.url).href
const FrameImg2 = new URL('@/assets/frame2.png', import.meta.url).href
const FrameImg3 = new URL('@/assets/frame3.png', import.meta.url).href

const framelist =[
  FrameImg1,FrameImg2,FrameImg3
]
export default function ComplaxePhone() {
  const {photos}=useRootStore()
  const canvasRef=useRef(null)
  const composer=useRef(null)
  const [active,setActive] =useState(0)
  const init =()=>{
    if(composer.current) return ;
     composer.current = new ImageFrameComposer(canvasRef.current, {
      maxWidth: 400,
      minRegionSize: 10, // 忽略小于 10px 的区域
      blockSize: 4, // 每 4 像素扫描一次
      onRenderComplete: () => {
        console.log('渲染完成')
      },
    });
  }
  
  useEffect(()=>{
    init()
  },[])

  const generate = async () => {
    if (!photos || photos.length === 0) {
      message.error('没有可用的图片')
      return
    }
    try {
      await composer.current.setFrameImage(framelist[active])
      // 使用 photos 中的第一张图片
      const _photos=photos.map(s=>s.src)
      await composer.current.setContentImages(_photos)
    } catch (error) {
      console.error('图片加载失败:', error)
    }
  }

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <ul className='flex justify-start items-center gap-2'> 
        {
          framelist.map((v,index)=>(
          <li key={index} className={`${active===index? 'border-2  border-primary-500':'border-2 border-transparent'}  rounded-md select-none cursor-pointer `}  onClick={()=>{setActive(index); generate()}}>
            <img draggable={false} src={v} width={200} height={300} alt="" />
          </li>
          ))
        }
      </ul>
      <Button className='mt-5' type='primary' onClick={()=>generate()}>生成图片</Button>
    </div>
  )
}
