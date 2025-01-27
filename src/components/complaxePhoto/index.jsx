import React, { useState, useRef } from 'react';
import { Button, Card, Col, Row, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import cv2 from 'opencv-js';

const PhotoCollage = ({ borderImage }) => {
  const [photos, setPhotos] = useState([]);
  const canvasRef = useRef(null);

  const capturePhoto = () => {
    if (photos.length < getMaxPhotos(borderImage)) {
      setPhotos(prev => [...prev, '/api/placeholder/300/300']);
    } else {
      message.warning('已达到最大照片数量');
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const composeCollage = () => {
    const usableAreas = getUsableAreas(borderImage);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    photos.forEach((photo, index) => {
      const [x, y, w, h] = usableAreas[index];
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, x, y, w, h);
      };
      img.src = photo;
    });

    return canvas.toDataURL('image/jpeg');
  };

  return (
    <Card className="p-4 max-w-md mx-auto">
      <Button 
        onClick={capturePhoto}
        disabled={photos.length >= getMaxPhotos(borderImage)}
        type="primary"
        block
        className="mb-4"
      >
        Add Photo ({photos.length}/{getMaxPhotos(borderImage)})
      </Button>

      <Row gutter={8}>
        {photos.map((photo, index) => (
          <Col key={index} span={12}>
            <div className="relative">
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`} 
                className="w-full h-40 object-cover"
              />
              <Button 
                onClick={() => removePhoto(index)}
                type="text"
                className="absolute top-0 right-0 bg-red-500 text-white p-1"
              >
                <CloseOutlined />
              </Button>
            </div>
          </Col>
        ))}
      </Row>

      {photos.length > 0 && (
        <Button 
          onClick={() => {
            const collage = composeCollage();
            console.log(collage);
          }}
          type="primary"
          block
          className="mt-4"
        >
          Generate Collage
        </Button>
      )}
    </Card>
  );
};

function getUsableAreas(borderImage) {
  const img = cv2.imread(borderImage);
  const gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY);
  const  thresh = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY_INV);
  const contours = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0];

  const usableAreas = [];
  for (const cnt of contours) {
    const [x, y, w, h] = cv2.boundingRect(cnt);
    usableAreas.push([x, y, w, h]);
  }
  return usableAreas;
}

function getMaxPhotos(borderImage) {
  return getUsableAreas(borderImage).length;
}

export default PhotoCollage;