import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePhoto = ({ photo, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `photo-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group touch-none select-none"
    >
      <img
        src={photo}
        alt={`照片 ${index + 1}`}
        className="w-full h-48 object-cover rounded-lg shadow-md"
      />
      <button
        onClick={(e) => {
          e.stopPropagation(); // 防止事件冒泡
          onDelete(index);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {index + 1}/4
      </div>
    </div>
  );
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [facingMode, setFacingMode] = useState("user");
  const [zoomLevel, setZoomLevel] = useState(1);
  const MAX_PHOTOS = 4;

  // 检查摄像头权限
  useEffect(() => {
    async function checkCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
        // 记得关闭测试流
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Camera error:', err);
        setError(err.message);
        setHasPermission(false);
        setIsCameraOn(false);
      }
    }
    
    checkCameraPermission();
  }, []);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
    advanced: [{ zoom: zoomLevel }]
  };

  // 重新配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 的移动距离才触发拖拽
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // 减少延迟时间
        tolerance: 8, // 与 PointerSensor 保持一致
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    // 可以添加拖拽开始时的视觉反馈
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setPhotos((items) => {
        const oldIndex = parseInt(active.id.split('-')[1]);
        const newIndex = parseInt(over.id.split('-')[1]);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 修改拍照功能，添加数量限制
  const capture = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) {
      alert('最多只能拍摄4张照片');
      return;
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhotos((prevPhotos) => [...prevPhotos, imageSrc]);
    }
  }, [webcamRef, photos.length]);

  // 修改删除照片函数
  const deletePhoto = useCallback((index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  }, []);

  // 倒计时拍照
  const startCountdown = useCallback(() => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          capture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [capture]);

  // 切换前后摄像头
  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  // 设置缩放级别
  const setZoom = (level) => {
    setZoomLevel(level);
    if (webcamRef.current && webcamRef.current.video) {
      const track = webcamRef.current.video.srcObject.getVideoTracks()[0];
      if (track.getCapabilities().zoom) {
        track.applyConstraints({ advanced: [{ zoom: level }] });
      }
    }
  };

  // 显示错误信息
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2">请确保：</p>
          <ul className="list-disc ml-5">
            <li>已允许浏览器访问摄像头</li>
            <li>摄像头未被其他应用程序占用</li>
            <li>设备已正确连接摄像头</li>
          </ul>
        </div>
      </div>
    );
  }

  // 等待权限检查
  if (hasPermission === null) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在检查摄像头权限...</p>
        </div>
      </div>
    );
  }

  // 没有权限
  if (hasPermission === false) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">提示：</strong>
          <span className="block sm:inline">需要摄像头权限才能使用此功能。</span>
          <p className="mt-2">请在浏览器设置中允许访问摄像头，然后刷新页面。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4   w-full h-auto">
      {/* 添加照片计数 */}
      <div className="text-center mb-4">
        <span className="text-lg font-semibold">
          已拍摄 {photos.length}/{MAX_PHOTOS} 张
        </span>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-full max-w-2xl rounded-lg overflow-hidden shadow-lg bg-white">
          {isCameraOn ? (
            <div className="aspect-video md:h-[480px] lg:h-[720px]">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">摄像头已关闭</span>
            </div>
          )}
          
          {/* 倒计时显示 */}
          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl text-white font-bold">{countdown}</span>
            </div>
          )}
        </div>

        {/* 控制按钮组 */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {/* 切换摄像头按钮 */}
          <button
            onClick={toggleCamera}
            className="px-4 py-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
          >
            切换摄像头
          </button>

          {/* 缩放按钮组 */}
          <div className="flex gap-2">
            {[1, 2, 3, 5].map((zoom) => (
              <button
                key={zoom}
                onClick={() => setZoom(zoom)}
                className={`px-4 py-2 rounded-full ${
                  zoomLevel === zoom
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {zoom}x
              </button>
            ))}
          </div>

          {/* 拍照按钮组 */}
          <button
            onClick={capture}
            className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            立即拍照
          </button>

          <button
            onClick={startCountdown}
            className="px-4 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            3秒倒计时拍照
          </button>
        </div>
      </div>

      {/* 修改照片预览区，添加拖拽功能 */}
      {photos.length > 0 && (
        <div className="mt-8 h-auto overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">照片预览（可拖拽排序）</h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((_, index) => `photo-${index}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={`photo-${index}`}
                    photo={photo}
                    index={index}
                    onDelete={deletePhoto}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default Camera;
