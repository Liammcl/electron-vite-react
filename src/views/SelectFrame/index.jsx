import { useRef, useEffect, useState } from 'react'
import { ImageFrameComposer } from '@/utils/ImageFrameComposer'
import { Button, message, Carousel } from 'antd'
import { useRootStore } from '@/context/rootContext'
import { useNavigate } from 'react-router-dom'
// 导入框架图片
const FrameImg1 = new URL('@/assets/frame1.png', import.meta.url).href
const FrameImg2 = new URL('@/assets/frame2.png', import.meta.url).href
const FrameImg3 = new URL('@/assets/frame3.png', import.meta.url).href

const framelist = [FrameImg1, FrameImg2, FrameImg3]

export default function SelectFrame() {
  const navigate = useNavigate()
  const { photos } = useRootStore()
  const canvasRef = useRef(null)
  const composer = useRef(null)
  const [active, setActive] = useState(0)

  const init = () => {
    if (composer.current) return
    composer.current = new ImageFrameComposer(canvasRef.current, {
      maxWidth: window.innerWidth > 768 ? 600 : 400, // 根据屏幕宽度调整画布大小
      minRegionSize: 10,
      blockSize: 4,
      onRenderComplete: () => {
        console.log('渲染完成')
      },
    })
  }

  useEffect(() => {
    init()
    // 添加窗口大小变化监听
    const handleResize = () => {
      if (composer.current) {
        composer.current.updateMaxWidth(window.innerWidth > 768 ? 600 : 400)
        generate()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const generate = async () => {
    if (!photos || photos.length === 0) {
      message.error('没有可用的图片')
      navigate('/takePhoto')
      return
    }
    try {
      await composer.current.setFrameImage(framelist[active])
      const _photos = photos.map(s => s.src)
      await composer.current.setContentImages(_photos)
    } catch (error) {
      console.error('图片加载失败:', error)
    }
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 左侧画布区域 */}
        <div className="flex-1 flex justify-center items-start">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto shadow-lg rounded-lg"
          />
        </div>

        {/* 右侧控制区域 */}
        <div className="lg:w-80">
          <h2 className="text-xl font-bold mb-4">选择框架</h2>
          <Carousel
            dots={true}
            autoplay
            autoplaySpeed={3000}
            beforeChange={(from, to) => {
              setActive(to)
              generate()
            }}
          >
            {framelist.map((v, index) => (
              <div key={index}>
                <div className={`
                  p-2 rounded-lg overflow-hidden cursor-pointer
                  ${active === index ? 'ring-2 ' : ''}
                `}>
                  <img
                    src={v}
                    className="w-full h-auto object-cover rounded-lg"
                    draggable={false}
                    alt={`框架 ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </Carousel>
          <Button 
            type="primary" 
            className="w-full mt-6"
            onClick={generate}
          >
            生成图片
          </Button>
        </div>
      </div>
    </div>
  )
}
