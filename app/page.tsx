'use client'
//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import ipp from 'ipp';
import Image from 'next/image';
const SignatureComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastX = 0;
    let lastY = 0;

    const draw = (x, y) => {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);

      ctx.lineTo(x, y);
      ctx.stroke();
      [lastX, lastY] = [x, y];
    };

    const startDrawing = (e) => {
      setIsDrawing(true);
      [lastX, lastY] = [e.offsetX || e.touches[0].clientX - canvas.offsetLeft,
      e.offsetY || e.touches[0].clientY - canvas.offsetTop];
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const drawTouch = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX - canvas.offsetLeft;
      const y = touch.clientY - canvas.offsetTop;
      draw(x, y);
    };

    const drawMouse = (e) => {
      if (!isDrawing) return;
      draw(e.offsetX, e.offsetY);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', drawMouse);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', drawMouse);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', drawTouch);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing]);

  const getSignatureImage = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    const image = getSignatureImage();
    onSave(image);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="350"
        height="150"
        style={{ border: '1px solid black', touchAction: 'none' }}
      />
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105" onClick={handleSave}>保存签名</button>
    </div>
  );
};

const ReceiptWithSignature = ({ signatureImage, productName }) => {
  const handlePrint = () => {
    const currentDate = new Date().toLocaleString();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>商品回执</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt { width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
            .signature { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h2>商品回执</h2>
            <p><strong>日期时间：</strong> ${currentDate}</p>
            <p><strong>商品名称：</strong> ${productName}</p>
            <div class="signature">
              <p><strong>客户签名：</strong></p>
              <img src="${signatureImage}" alt="Signature" style="width: 100%; max-width: 300px;">
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h2>回执预览</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px' }}>
        <p><strong>日期时间：</strong> {new Date().toLocaleString()}</p>
        <p><strong>商品名称：</strong> {productName}</p>
        <div>
          <p><strong>客户签名：</strong></p>
          <img src={signatureImage} alt="Signature" style={{ width: '100%', maxWidth: '300px' }} />
        </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handlePrint}>使用浏览器功能打印回执</button>
    </div>
  );
};





// 注册网络适配器
const ReceWifiWithSignature = ({ signatureImage, productName }) => {

  const handlePrint = async () => {
    try {
      alert("请改为你的局域网打印机Id")
      return;
      const printer = null;
      {/* await ipp.Printer('http://192.168.2.148:9100'); // 替换为你的打印机IP */ }

      const fileBuffer = Buffer.from(
        "This is a test print from React application!",
        "utf-8"
      );

      const msg = {
        "operation-attributes-tag": {
          "requesting-user-name": "React User",
          "job-name": "React Print Job",
          "document-format": "text/plain"
        },
        data: fileBuffer
      };

      printer.execute("Print-Job", msg, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log(res);
        }
      });


    } catch (error) {
      console.error('打印失败:', error);
      alert('打印失败，请检查打印机连接和配置');
    }

  };

  return (
    <div>
      <button onClick={handlePrint}>打印</button>
    </div>
  );


};





const App = () => {

  const [signatureImage, setSignatureImage] = useState(null);
  const [productName, setProductName] = useState('');

  const handleSaveSignature = (image) => {
    setSignatureImage(image);
  };

  return (
    <main>

      <div style={{ padding: '20px' }}>
        <h1>商品回执签名系统</h1>
        <div>
          <label htmlFor="productName">商品名称：</label>
          <input
            className="border border-gray-300 rounded-md p-2"
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <SignatureComponent onSave={handleSaveSignature} />
        {signatureImage && <ReceiptWithSignature signatureImage={signatureImage} productName={productName} />}


        <main className="container mx-auto p-4">
          <h1 className="">WiFi 打印示例</h1>
          <p>
            code:
            const printer = await ipp.Printer(&quothttp://192.168.2.148:9100&quot)  //替换为你的打印机IP
          </p>

          {/* <ReceWifiWithSignature /> */}
        </main>

        <main className="contain
        er mx-auto p-4">
          <h1 className="">蓝牙-打印示例</h1>
          <p>
            暂时没有蓝牙打印机测试中
            使用这这个 react-native-esc-pos-printer 库;
            连接到打印机
            await BluetoothManager.connect(&#34YOUR_PRINTER_MAC_ADDRESS&#34);
          </p>
        </main>

      </div>


    </main>
  );
};

export default App;