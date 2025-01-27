import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
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
import { Button, Select } from 'antd';
import gifshot from 'gifshot';
import { useRootStore } from '@/context/rootContext';
const SortablePhoto = ({ photo, index, onDelete, activeId, overId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `photo-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  const isActive = activeId === `photo-${index}`;
  const isOver = overId === `photo-${index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative group touch-none select-none
        ${isActive ? 'scale-105' : ''}
        ${isOver ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'shadow-xl' : 'shadow-md'}
        rounded-lg transition-all duration-200
      `}
    >
      <img
        src={photo.src}
        alt={`照片 ${index + 1}`}
        className="w-full h-48 object-cover rounded-lg"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOver && !isActive && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
          <div className="absolute inset-0 bg-blue-500 opacity-10"></div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {index + 1}/4
      </div>
    </div>
  );
};

const Camera = () => {
  const {photos,setPhotos}=useRootStore()
  const webcamRef = useRef(null);
  const [burstSets, setBurstSets] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [facingMode, setFacingMode] = useState("user");
  const [zoomLevel, setZoomLevel] = useState(1);
  const MAX_PHOTOS = 4;
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const BURST_COUNT = 5;

  // 检查摄像头权限
  useEffect(() => {
    async function checkCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
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

  // 获取摄像头列表
  useEffect(() => {
    async function getDevices() {
      try {
        // 先请求权限
        await navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            // 获取到权限后立即停止预览流
            stream.getTracks().forEach(track => track.stop());
          });
        
        // 获取设备列表
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', videoDevices);
        setCameras(videoDevices);

        // 如果有可用摄像头且未选择，则默认选择第一个
        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('无法访问摄像头: ' + err.message);
      }
    }

    getDevices();

    // 监听设备变化
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  // 修改拍照功能
  const capture = useCallback(async () => {
    try {
      if (!webcamRef.current) {
        throw new Error('摄像头未初始化');
      }

      setIsCapturing(true);
      const burstShots = [];

      // 连续拍摄
      for (let i = 0; i < BURST_COUNT; i++) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
          throw new Error('无法获取照片');
        }
        burstShots.push(imageSrc);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 生成唯一ID，用于关联主照片和连拍组
      const burstId = Date.now().toString();

      // 生成 GIF
      gifshot.createGIF({
        images: burstShots,
        gifWidth: 480,
        gifHeight: 360,
        interval: 0.3,
        progressCallback: (progress) => {
          console.log('GIF 生成进度：', Math.round(progress * 100) + '%');
        },
      }, (obj) => {
        if (!obj.error) {
          // 将主照片和连拍数据一起保存
          setPhotos(prevPhotos => [...prevPhotos, {
            id: burstId,
            src: burstShots[0]
          }]);
          
          setBurstSets(prevSets => [...prevSets, {
            id: burstId,
            photos: burstShots,
            gif: obj.image
          }]);
        } else {
          console.error('GIF 生成失败：', obj.error);
        }
        setIsCapturing(false);
      });

      setError(null);
    } catch (err) {
      console.error('拍照失败:', err);
      setError(err.message);
      setIsCapturing(false);
    }
  }, []);

  // 修改删除照片函数
  const deletePhoto = useCallback((index) => {
    const photoToDelete = photos[index];
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    setBurstSets(prevSets => prevSets.filter(set => set.id !== photoToDelete.id));
  }, [photos]);

  // 修改倒计时拍照功能
  const startCountdown = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) {
      setError('最多只能拍摄4张照片');
      return;
    }

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
  }, [capture, photos.length]);

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

  // 更新视频约束
  const videoConstraints = useMemo(() => ({
    width: 1280,
    height: 720,
    deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
    facingMode: selectedCamera ? undefined : facingMode,
  }), [selectedCamera, facingMode]);

  // 处理摄像头切换
  const handleCameraChange = async (deviceId) => {
    try {
      setSelectedCamera(deviceId);
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      console.error('切换摄像头失败:', err);
      setError(`切换摄像头失败: ${err.message}`);
    }
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
    setActiveId(active.id);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setOverId(over?.id || null);
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
    
    setActiveId(null);
    setOverId(null);
    document.body.style.cursor = '';
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    document.body.style.cursor = '';
  };

  // 确保摄像头初始化完成
  useEffect(() => {
    if (selectedCamera && webcamRef.current && webcamRef.current.video) {
      // 等待视频准备就绪
      webcamRef.current.video.onloadedmetadata = () => {
        console.log('摄像头已准备就绪');
      };
    }
  }, [selectedCamera]);

  // 监听摄像头变化
  useEffect(() => {
    // 监听设备变化
    const handleDeviceChange = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);

        // 检查当前选中的摄像头是否还存在
        if (selectedCamera && !videoDevices.some(device => device.deviceId === selectedCamera)) {
          // 如果当前选中的摄像头不存在了，切换到第一个可用的摄像头
          if (videoDevices.length > 0) {
            handleCameraChange(videoDevices[0].deviceId);
          }
        }
      } catch (err) {
        console.error('获取设备列表失败:', err);
        setError('获取设备列表失败: ' + err.message);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [selectedCamera]);

  // 修改拍照按钮状态
  const renderCaptureButton = () => (
    <button
      onClick={capture}
      disabled={photos.length >= MAX_PHOTOS || !isCameraOn || isCapturing}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium 
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 h-10 px-4 py-2
        ${photos.length >= MAX_PHOTOS || !isCameraOn || isCapturing
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-blue-600 text-white shadow hover:bg-blue-700'}
      `}
    >
      {isCapturing ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          连拍中...
        </span>
      ) : '拍照'}
    </button>
  );

  // 修改 GIF 预览区域渲染逻辑
  const renderGifPreviews = () => {
    if (burstSets.length === 0) return null;

    return (
      <div className="space-y-8 mt-8">
        <h3 className="text-lg font-medium">连拍预览</h3>
        {burstSets.map((burstSet, index) => {
          const photoIndex = photos.findIndex(p => p.id === burstSet.id);
          if (photoIndex === -1) return null; // 如果找不到对应的主照片，不显示预览

          return (
            <div key={burstSet.id} className="space-y-4 border-b pb-8 last:border-b-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  照片 {photoIndex + 1} 的连拍预览
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GIF 预览 */}
                <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={burstSet.gif}
                    alt={`连拍 GIF ${photoIndex + 1}`}
                    className="w-full object-contain"
                  />
                </div>

                {/* 连拍原始照片预览 */}
                <div className="grid grid-cols-5 gap-2">
                  {burstSet.photos.map((photo, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`连拍照片 ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
    <div className="w-full max-w-4xl mx-auto xl:p-6 p-1 space-y-8">
      {/* 标题和摄像头选择区域 */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">拍照上传</h2>
        
        </div>
        
        {/* 照片计数器 */}
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
          <span className="text-sm font-medium text-gray-700">已拍摄照片</span>
          <span className="text-sm font-semibold bg-gray-200 px-2.5 py-0.5 rounded-full">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>
      </div>

      {/* 摄像头预览区域 */}
      <div className="overflow-hidden rounded-xl border-0 md:border bg-white shadow-sm mx-[-8px] md:mx-0 border-x-2 md:border-x border-gray-200">
        <div className="relative w-full">
          {/* 修改这里的高度计算方式 */}
          <div className="relative w-full h-[50vh] md:pb-[56.25%] md:h-auto">
            {isCameraOn && (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
                onUserMediaError={(err) => {
                  console.error('摄像头错误:', err);
                  setError('摄像头访问失败: ' + err.message);
                  setIsCameraOn(false);
                }}
                onUserMedia={(stream) => {
                  console.log('摄像头已连接');
                  setError(null);
                }}
                mirrored={facingMode === "user"}
              />
            )}
            
            {/* 倒计时显示 */}
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <span className="text-6xl md:text-8xl text-white font-bold animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 控制按钮组 - 优化移动端布局 */}
        <div className="border-t p-4">
          <div className="flex flex-col gap-4">
            {/* 摄像头选择下拉框 */}
            {cameras.length > 0 && (
              <div className="w-full">
                <Select
                  variant='filled'
                  value={selectedCamera}
                  onChange={handleCameraChange}
                  className="w-full"
                  placeholder="选择摄像头"
                  options={cameras.map((camera) => ({
                    label: camera.label || `摄像头 ${cameras.indexOf(camera) + 1}`,
                    value: camera.deviceId,
                  }))}
                />
              </div>
            )}

            {/* 缩放控制按钮组 */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((zoom) => (
                <Button
                  key={zoom}
                  type="primary"
                  onClick={() => setZoom(zoom)}
                  className={`
                    ${zoomLevel === zoom 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  {zoom}x
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {renderCaptureButton()}
              <Button
              type='primary'
                onClick={startCountdown}
                disabled={photos.length >= MAX_PHOTOS || !isCameraOn}
                className={`
                  ${photos.length >= MAX_PHOTOS || !isCameraOn
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow hover:bg-indigo-700'}
                `}
              >
                3秒倒计时
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 照片预览区域 - 优化网格布局 */}
      {photos.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">照片预览</h3>
            <span className="text-sm text-gray-500">拖拽可调整顺序</span>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={photos.map((_, index) => `photo-${index}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <SortablePhoto
                    key={`photo-${index}`}
                    photo={photo}
                    index={index}
                    onDelete={deletePhoto}
                    activeId={activeId}
                    overId={overId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* 连拍预览区域 */}
      {renderGifPreviews()}

      {/* 错误提示 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">出错了</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
