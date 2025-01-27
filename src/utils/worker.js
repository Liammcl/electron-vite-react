// 处理区域查找的主要逻辑
function findRegions(imageData, width, height, minRegionSize, blockSize) {
  const regions = [];
  const visited = new Set();
  const data = new Uint8ClampedArray(imageData.data);

  // 检查像素是否为透明
  function isTransparent(x, y) {
    const index = (y * width + x) * 4;
    return data[index + 3] === 0;
  }

  // 深度优先搜索找到连续区域
  function dfs(x, y, region) {
    if (
      x < 0 || x >= width || 
      y < 0 || y >= height || 
      visited.has(`${x},${y}`) || 
      !isTransparent(x, y)
    ) {
      return;
    }

    visited.add(`${x},${y}`);
    region.minX = Math.min(region.minX, x);
    region.maxX = Math.max(region.maxX, x);
    region.minY = Math.min(region.minY, y);
    region.maxY = Math.max(region.maxY, y);

    // 按块大小搜索，提高性能
    for (let dx = -blockSize; dx <= blockSize; dx += blockSize) {
      for (let dy = -blockSize; dy <= blockSize; dy += blockSize) {
        dfs(x + dx, y + dy, region);
      }
    }
  }

  // 扫描图像寻找透明区域
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      if (!visited.has(`${x},${y}`) && isTransparent(x, y)) {
        const region = {
          minX: x,
          maxX: x,
          minY: y,
          maxY: y
        };
        dfs(x, y, region);

        // 只保留足够大的区域
        const regionWidth = region.maxX - region.minX;
        const regionHeight = region.maxY - region.minY;
        if (regionWidth >= minRegionSize && regionHeight >= minRegionSize) {
          regions.push(region);
        }
      }
    }
  }

  return regions;
}

// 监听主线程消息
self.onmessage = (e) => {
  const { type, data } = e.data;
  
  if (type === "FIND_REGIONS") {
    const { imageData, width, height, minRegionSize, blockSize } = data;
    const regions = findRegions(imageData, width, height, minRegionSize, blockSize);
    
    self.postMessage({
      type: "REGIONS_FOUND",
      data: { regions }
    });
  }
}; 