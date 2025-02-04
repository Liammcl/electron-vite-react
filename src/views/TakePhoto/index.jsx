import React, { useRef, useState, useCallback } from "react";
import LogoWarp from "@/utils/logoWarp";
import { useRootStore } from "@/context/rootContext";
import Webcam from "react-webcam";
import { Switch, Skeleton } from "antd";

const PhotoGrid = ({ photos, MAX_PHOTOS, onDelete }) => {
  // 生成空占位数组
  const placeholders = Array(MAX_PHOTOS).fill(null);

  return (
    <ul className="flex flex-col gap-4  ">
      {placeholders.map((_, index) => {
        const photo = photos[index];
        return (
          <li
            key={index}
            className={`
              relative aspect-square rounded-lg overflow-hidden group
              ${
                !photo
                  ? "bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600"
                  : ""
              }
            `}
          >
            {photo ? (
              <>
                <img
                  src={photo.src}
                  alt={`photo-${photo.id}`}
                  className="w-20 h-20 object-cover"
                />
                <span
                  onClick={() => onDelete(index)}
                  className="material-symbols-rounded absolute top-2 right-2 text-red-500 
                    opacity-0 group-hover:opacity-100 md:group-focus:opacity-100
                    transition-opacity duration-200 cursor-pointer
                    touch:opacity-100 md:touch:opacity-0"
                >
                  delete_forever
                </span>
              </>
            ) : (
              <div className="w-20 h-20  flex items-center justify-center text-gray-400">
                <span className="text-sm">{index + 1}</span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default function TakePhoto() {
  const MAX_PHOTOS = 4;
  const { photos, setPhotos, isCameraOn, error, setError } = useRootStore();
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 拍照功能
  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      if (!isMirrored) {
        setPhotos((prev) => [
          ...prev,
          { id: Date.now().toString(), src: imageSrc },
        ]);
        return;
      }

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);

        const mirroredImage = canvas.toDataURL("image/jpeg");
        setPhotos((prev) => [
          ...prev,
          { id: Date.now().toString(), src: mirroredImage },
        ]);
      };
    }
  }, [setPhotos, isMirrored]);

  // 倒计时拍照
  const startCountdown = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) return;
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

  // 修改镜像切换处理函数
  const handleMirrorToggle = useCallback(
    (checked) => {
      setIsLoading(true);
      setIsMirrored(checked);

      if (webcamRef.current && webcamRef.current.video) {
        const stream = webcamRef.current.video.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        }

        setTimeout(() => {
          if (webcamRef.current) {
            webcamRef.current.video.srcObject = null;
            navigator.mediaDevices
              .getUserMedia({
                video: {
                  width: 1280,
                  height: 720,
                  facingMode: "user",
                },
              })
              .then((newStream) => {
                if (webcamRef.current && webcamRef.current.video) {
                  webcamRef.current.video.srcObject = newStream;
                  webcamRef.current.video.play();
                  setIsLoading(false);
                }
              })
              .catch((err) => {
                console.error("重新初始化摄像头失败:", err);
                setError("重新初始化摄像头失败");
                setIsLoading(false);
              });
          }
        }, 100);
      }
    },
    [setError]
  );

  // 删除照片处理函数
  const handleDeletePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="h-full w-full p-8">
      <div className="flex items-center justify-between">
        <LogoWarp />
        <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
          {countdown > 0 ? `${countdown}秒后拍照` : "准备就绪"}
        </div>
      </div>

      <div className="flex items-center flex-col justify-center -mt-6 md:-mt-10 gap-4">
        <div className="text-sm md:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-200">
          请看上方镜头
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm md:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-200">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </div>
        <div className="flex items-center gap-8">
          <div className="w-full max-w-6xl aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative min-h-[400px]">
            {isCameraOn && (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className={`w-full h-full object-cover ${
                    isLoading ? "hidden" : "block"
                  }`}
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user",
                  }}
                  mirrored={isMirrored}
                />

                {/* 骨架屏 */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Skeleton.Image
                      active
                      className="!w-full !h-full"
                      style={{
                        width: "100%",
                        height: "400px",
                        margin: 0,
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <span className="text-6xl md:text-8xl text-white font-bold animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </div>

          <div className=" flex justify-center flex-col gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isMirrored}
                onChange={handleMirrorToggle}
                className="bg-gray-300 dark:bg-gray-600"
                disabled={isLoading}
                style={{
                  backgroundColor: isMirrored ? "#1890ff" : undefined,
                }}
              />
              <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                镜像模式 {isLoading && "(切换中...)"}
              </label>
            </div>
            <button
              onClick={capture}
              disabled={photos.length >= MAX_PHOTOS || !isCameraOn}
              className=" dark:bg-gray-300 bg-gray-600 rounded-full w-10 h-10 text-sm font-medium transition-colors"
            ></button>

            <button
              onClick={startCountdown}
              disabled={photos.length >= MAX_PHOTOS || !isCameraOn}
              className={`
            px-6 py-3 rounded-full text-sm font-medium transition-colors
            ${
              photos.length >= MAX_PHOTOS || !isCameraOn
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            }
          `}
            >
              倒计时拍照
            </button>
          </div>
          {/* 照片网格 */}
          <PhotoGrid
            photos={photos}
            MAX_PHOTOS={MAX_PHOTOS}
            onDelete={handleDeletePhoto}
          />
        </div>
      </div>
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 p-4 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
