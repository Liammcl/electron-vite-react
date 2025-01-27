class ImageFrameComposer {
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
    this.contentImage = null;
    this.maxWidth = options.maxWidth || 800;
    this.onRenderComplete = options.onRenderComplete || null;

    // 创建内联的 Worker
    const workerCode = `
        class RegionFinder {
          constructor(imageData, width, height, options = {}) {
            this.data = new Uint8ClampedArray(imageData.data);
            this.width = width;
            this.height = height;
            this.visitedArray = new Uint8Array(width * height);
            this.minRegionSize = options.minRegionSize || 10;
            this.blockSize = options.blockSize || 4;
            
            this.stackSize = 0;
            this.maxStackSize = 1024 * 1024;
            this.stackArray = new Int32Array(this.maxStackSize * 2);
          }
  
          pushStack(x, y) {
            if (this.stackSize >= this.maxStackSize) return false;
            this.stackArray[this.stackSize * 2] = x;
            this.stackArray[this.stackSize * 2 + 1] = y;
            this.stackSize++;
            return true;
          }
  
          popStack() {
            if (this.stackSize === 0) return null;
            this.stackSize--;
            return {
              x: this.stackArray[this.stackSize * 2],
              y: this.stackArray[this.stackSize * 2 + 1]
            };
          }
  
          findRegions() {
            const regions = [];
            const blockSize = this.blockSize;
  
            for (let y = 0; y < this.height; y += blockSize) {
              for (let x = 0; x < this.width; x += blockSize) {
                const index = (y * this.width + x) * 4;
                if (this.data[index + 3] < 128 && !this.visitedArray[y * this.width + x]) {
                  const region = this.floodFill(x, y);
                  if (region && 
                      region.maxX - region.minX > this.minRegionSize && 
                      region.maxY - region.minY > this.minRegionSize) {
                    regions.push(region);
                  }
                }
              }
            }
            return regions;
          }
  
          floodFill(startX, startY) {
            const region = {
              minX: startX,
              minY: startY,
              maxX: startX,
              maxY: startY
            };
  
            this.stackSize = 0;
            if (!this.pushStack(startX, startY)) return null;
  
            while (this.stackSize > 0) {
              const point = this.popStack();
              const { x, y } = point;
              const pos = y * this.width + x;
  
              if (this.visitedArray[pos]) continue;
  
              const index = pos * 4;
              if (this.data[index + 3] >= 128) continue;
  
              this.visitedArray[pos] = 1;
              region.minX = Math.min(region.minX, x);
              region.minY = Math.min(region.minY, y);
              region.maxX = Math.max(region.maxX, x);
              region.maxY = Math.max(region.maxY, y);
  
              if (x + 1 < this.width) this.pushStack(x + 1, y);
              if (x - 1 >= 0) this.pushStack(x - 1, y);
              if (y + 1 < this.height) this.pushStack(x, y + 1);
              if (y - 1 >= 0) this.pushStack(x, y - 1);
            }
  
            return region;
          }
        }
  
        self.onmessage = function(e) {
          const { type, data } = e.data;
          if (type === 'FIND_REGIONS') {
            const { imageData, width, height, minRegionSize, blockSize } = data;
            const finder = new RegionFinder(imageData, width, height, { minRegionSize, blockSize });
            const regions = finder.findRegions();
            self.postMessage({ type: 'REGIONS_FOUND', data: { regions } });
          }
        };
      `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob));

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

  async setContentImage(source) {
    try {
      this.contentImage = await this.loadImage(source);
      this.render();
      return true;
    } catch (error) {
      console.error("Failed to set content image:", error);
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
    if (!this.contentImage) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    regions.forEach((region) => {
      const width = region.maxX - region.minX;
      const height = region.maxY - region.minY;

      const scale = Math.max(
        width / this.contentImage.width,
        height / this.contentImage.height
      );
      const scaledWidth = this.contentImage.width * scale;
      const scaledHeight = this.contentImage.height * scale;

      const x = region.minX + (width - scaledWidth) / 2;
      const y = region.minY;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(region.minX, region.minY, width, height);
      this.ctx.clip();
      this.ctx.drawImage(this.contentImage, x, y, scaledWidth, scaledHeight);
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
    if (!this.frameImage || !this.contentImage) return false;

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
