export class ImageFrameComposer {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Canvas element is required");
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });

    this.frameImage = null;
    this.contentImages = [];
    this.maxWidth = options.maxWidth || 800;
    this.onRenderComplete = options.onRenderComplete || null;

    // 修改 Worker 创建方式
    this.worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });

    // 处理 Worker 消息
    this.worker.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === "REGIONS_FOUND") {
        this.renderImages(data.regions);
        if (this.onRenderComplete) {
          this.onRenderComplete(this.getImageURL());
        }
      }
    };
  }

  // ... [其他方法保持不变] ...
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Image loading failed"));
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(source);
      } else if (typeof source === "string") {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image loading failed"));
        img.src = source;
      } else if (source instanceof Image) {
        resolve(source);
      } else {
        reject(new Error("Invalid image source"));
      }
    });
  }

  setMaxWidth(width) {
    this.maxWidth = width;
    if (this.frameImage) {
      this.render();
    }
    return this;
  }

  calculateScaledDimensions(width, height) {
    if (width <= this.maxWidth) return { width, height };
    const scale = this.maxWidth / width;
    return {
      width: this.maxWidth,
      height: Math.round(height * scale),
    };
  }

  async setFrameImage(source) {
    try {
      this.frameImage = await this.loadImage(source);
      this.render();
      return true;
    } catch (error) {
      console.error("Failed to set frame image:", error);
      return false;
    }
  }

  async setContentImages(sources) {
    try {
      // 清空现有图片
      this.contentImages = [];
      // 加载所有图片
      const promises = sources.map(source => this.loadImage(source));
      this.contentImages = await Promise.all(promises);
      this.render();
      return true;
    } catch (error) {
      console.error("Failed to set content images:", error);
      return false;
    }
  }

  getImageURL(type = "image/png", quality = 0.92) {
    return this.canvas.toDataURL(type, quality);
  }

  async getImageBlob(type = "image/png", quality = 0.92) {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), type, quality);
    });
  }

  initializeCanvas() {
    if (!this.frameImage) return;

    const { width, height } = this.calculateScaledDimensions(
      this.frameImage.width,
      this.frameImage.height
    );

    this.canvas.width = width;
    this.canvas.height = height;
    return { width, height };
  }

  renderImages(regions) {
    if (!this.contentImages.length || this.contentImages.length === 0) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 确保regions和图片数量匹配
    regions.forEach((region, index) => {
      // 循环使用图片
      const contentImage = this.contentImages[index % this.contentImages.length];
      
      const width = region.maxX - region.minX;
      const height = region.maxY - region.minY;

      const scale = Math.max(
        width / contentImage.width,
        height / contentImage.height
      );
      const scaledWidth = contentImage.width * scale;
      const scaledHeight = contentImage.height * scale;

      const x = region.minX + (width - scaledWidth) / 2;
      const y = region.minY;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(region.minX, region.minY, width, height);
      this.ctx.clip();
      this.ctx.drawImage(contentImage, x, y, scaledWidth, scaledHeight);
      this.ctx.restore();
    });

    this.ctx.drawImage(
      this.frameImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  render() {
    if (!this.frameImage || !this.contentImages.length) return false;

    const { width, height } = this.initializeCanvas();

    const offscreenCanvas = new OffscreenCanvas(width, height);
    const offscreenCtx = offscreenCanvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
    offscreenCtx.drawImage(this.frameImage, 0, 0, width, height);
    const imageData = offscreenCtx.getImageData(0, 0, width, height);

    this.worker.postMessage(
      {
        type: "FIND_REGIONS",
        data: {
          imageData,
          width,
          height,
          minRegionSize: 10,
          blockSize: 4,
        },
      },
      [imageData.data.buffer]
    );

    return true;
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      URL.revokeObjectURL(this.worker.objectURL);
      this.worker = null;
    }
  }
}
