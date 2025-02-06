import React, { useRef, useState, useCallback, Fragment } from "react";
import LogoWarp from "@/utils/logoWarp";
import { useRootStore } from "@/context/rootContext";
import Webcam from "react-webcam";
import { Switch, Skeleton, Progress } from "antd";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const PhotoGrid = ({ photos, MAX_PHOTOS, onDelete }) => {
  const placeholders = Array(MAX_PHOTOS).fill(null);
  return (
    <ul className=" w-full flex md:flex-col flex-row gap-4  justify-center items-center">
      {placeholders.map((_, index) => {
        const photo = photos[index];
        return (
          <li
            key={index}
            className={`
              relative aspect-square rounded-lg overflow-hidden group
              ${!photo
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
  const navigate = useNavigate()
  const { photos, setPhotos, isCameraOn, error, setError } = useRootStore();
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountdownMode, setIsCountdownMode] = useState(false);

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

  // 修改倒计时拍照功能
  const startCountdown = useCallback(() => {
    if (photos.length >= MAX_PHOTOS) {
      setIsCountdownMode(false);
      return;
    }

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          capture();

          // 如果还没拍够且倒计时模式仍然开启，继续下一张
          if (photos.length + 1 < MAX_PHOTOS && isCountdownMode) {
            setTimeout(startCountdown, 500); // 短暂延迟后开始下一次倒计时
          } else {
            setIsCountdownMode(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [capture, photos.length, isCountdownMode]);

  // 处理倒计时模式切换
  const handleCountdownMode = useCallback(() => {
    if (!isCountdownMode && photos.length < MAX_PHOTOS) {
      setIsCountdownMode(true);
      startCountdown();
    } else {
      setIsCountdownMode(false);
    }
  }, [isCountdownMode, photos.length, startCountdown]);

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
  }, [setPhotos]);

  return (
    <Fragment>
      <div className="h-full w-full p-8  flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <LogoWarp />
          <Progress
            type="circle"
            percent={countdown > 0 ? ((4 - countdown) / 4) * 100 : 0}
            size={50}
            format={() => countdown > 0 ? countdown : "0"}
            strokeWidth={6}
            className="dark:filter dark:invert [&_.ant-progress-circle-trail]:dark:stroke-gray-800"
            strokeColor="#000"
          />
        </div>

        <div className="flex items-center flex-col justify-center -mt-6 md:-mt-10 gap-4 w-full h-auto">
          <div className="text-sm md:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-200">
            请看上方镜头
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm md:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-200">
              {photos.length}/{MAX_PHOTOS}
            </span>
          </div>
          <div className="flex items-center flex-col md:flex-row  gap-8 w-auto h-full">
            <div className="flex gap-4 h-full">
              <div className="w-auto max-w-6xl aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative min-h-[280px] md:min-h-[400px]">
                {isCameraOn && (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className={`w-full h-full object-cover ${isLoading ? "hidden" : "block"}`}
                      videoConstraints={{
                        facingMode: "user",
                        width: { min: 320, ideal: 1280 },
                        height: { min: 240, ideal: 720 }
                      }}
                      mirrored={isMirrored}
                    />

                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton.Image
                          active
                          className="!w-full !h-full"
                          style={{
                            width: "100%",
                            height: "100%",
                            margin: 0,
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
                {countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <span className="text-4xl md:text-6xl lg:text-8xl text-white font-bold animate-pulse">
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
                <Button
                  onClick={capture}
                  disabled={photos.length >= MAX_PHOTOS || !isCameraOn}
                  className="rounded-full w-10 h-10 !p-0"
                  variant="outline"
                />

                <Button
                  onClick={handleCountdownMode}
                  disabled={photos.length >= MAX_PHOTOS || !isCameraOn}
                  variant={photos.length >= MAX_PHOTOS || !isCameraOn ? "ghost" : "outline"}
                >
                  {isCountdownMode ? "停止拍摄" : "倒计时模式"}
                </Button>
              </div>
            </div>
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
        <div className="  w-full  flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}><span className="material-symbols-rounded">
            arrow_back
          </span>返回</div>
          <div className="flex items-center gap-2" onClick={() => navigate('/selectFrame')}>下一步
            <span className="material-symbols-rounded">
              arrow_forward
            </span>
          </div>
        </div>

      </div>
    </Fragment>
  );
}
