import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/header';
import RecoloredPhoto from './components/recoloredPhoto';
import MaskPicker from './components/maskPicker';
import property from './property.png';
import overlay from './overlay.png';
import InputColor from 'react-input-color';
import axios from "axios";

import {
  BrowserRouter as Router,
} from "react-router-dom";

const App = (props) => {
  const maskUrls = [
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0000.png',
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0001.png',
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0002.png',
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0003.png',
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0004.png',
    'test_images/outputs/00dfa21c30506a655eca50f03981430dl-m3045378645r_cvs_0005.png',
  ];

  const [color, setColor] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('test_images/inputs/00dfa21c30506a655eca50f03981430dl-m3045378645r.jpg');
  const [maskUrl, setMaskUrl] = useState('blank_mask.png');
  const [coordinates, setCoordinates] = useState();
  const [imageSize, setImageSize] = useState({ width: 600, height: 400 });

  const params = new URLSearchParams(window.location.search);
  let url = params.get('url');
  if (url) {
    if (!url.startsWith('https:')) url = 'https:' + url;
    if (url !== photoUrl) setPhotoUrl(url);
  }

  useEffect(() => {
    const fetchMask = async () => {
      const newPhotoUrl = 'https://ap.rdcpix.com/36f677a5be44007fa42a8372b267febal-m3079665187od-w1024_h768_x2.webp';
      const body = {
        url: newPhotoUrl,
        test_ui_payload: [
          { x: coordinates[0], y: coordinates[1], want_child: true }
        ]
      };
      const response = await axios.post(
        'http://0.0.0.0:5000/api/img_info',
        body,
        {
          headers: { 'Access-Control-Allow-Origin': '*' },
          withCredentials: true,
        });
      if (response.status === 200) {
        setPhotoUrl(newPhotoUrl);
        setMaskUrl(response.data.maskUrl);
      }
    };

    if (coordinates) {
      console.log(coordinates);
      fetchMask();
    }
  }, [coordinates])

  const colorChanged = (color) => {
    setColor([color.r / 255, color.g / 255, color.b / 255]);
  };

  const maskChanged = (maskUrl) => {
    setMaskUrl(maskUrl);
  }

  const imageChanged = (width, height) => {
    setImageSize({ width, height });
  }

  const onMouseDown = (evt) => {
    const canvas = evt.target;

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    let canvasLeft = canvas.offsetLeft;
    let canvasTop = canvas.offsetTop;

    let elem = canvas;
    while (elem.offsetParent) {
      elem = elem.offsetParent;
      canvasLeft += elem.offsetLeft;
      canvasTop += elem.offsetTop;
    }

    const x = evt.clientX - canvasLeft + document.documentElement.scrollLeft;
    const y = evt.clientY - canvasTop + document.documentElement.scrollTop;

    const canvasAspect = canvasWidth / canvasHeight;
    const imageAspect = imageSize.width / imageSize.height;

    if (canvasAspect < imageAspect) {
      // Image sides are cropped
      const aspectRatios = imageAspect / canvasAspect;
      const offset = 0.5 * (1 - aspectRatios);
      const coordinates = [offset + ((x / canvasWidth) * aspectRatios), y / canvasHeight];
      setCoordinates(coordinates);
    } else {
      // Image top and bottom are cropped
      const aspectRatios = imageAspect / canvasAspect;
      const offset = 0.5 * (1 - aspectRatios);
      const coordinates = [x / canvasWidth, offset + ((y / canvasHeight) * aspectRatios)];
      setCoordinates(coordinates);
    }
  }

  return (
    <Router>
      <div className="App">
        <div className="App-header">
          <Header headerData/>
          <h1>Rose Colored Glasses</h1>
        </div>
        <div className="photo-container">
          <RecoloredPhoto
            onMouseDown={onMouseDown}
            onImageChanged={imageChanged}
            zorder="0"
            className="photo"
            photoUrl={photoUrl}
            maskUrl={maskUrl}
            color={color}/>
          <img src={overlay} alt="" className="overlay" zorder="1"/>
          <InputColor
            className="color-picker"
            initialValue="#FF007F"
            onChange={colorChanged}
            placement="right"/>
          <MaskPicker
            className="mask-picker"
            masks={maskUrls}
            onMaskChanged={maskChanged}/>
        </div>
        <img src={property} alt="Property details" />
        <div className="footer">
          <p>*https://www.clipartmax.com/middle/m2i8m2K9H7d3G6K9_realtor-com-logo-vector/</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
