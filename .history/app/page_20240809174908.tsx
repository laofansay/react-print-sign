'use client'
//@ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import ipp from 'ipp';
import Image from 'next/image';
import Link from 'next/link';
//import BluetoothPrinter from "./component/BluetoothPrinter"

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
      //alert("请改为你的局域网打印机IP")
      const printer = new ipp.Printer('http://192.168.2.148:9100'); // 替换为你的打印机IP 

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

      (printer.execute as any)("Print-Job", msg, (err: Error | null, res: any) => {
        if (err) {
          console.error('Error printing:', err);
        } else {
          console.log('Print job response:', res);
        }
      });


    } catch (error) {
      console.error('打印失败:', error);
      alert('打印失败，请检查打印机连接和配置');
    }

  };

  return (
    <div>
      <button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >wift打印</button>
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
    <main className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">商品回执签名系统</h1>

        <section className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
            <a
              href='/ser'
              className="hover:text-blue-800 transition duration-300 ease-in-out underline decoration-2 underline-offset-4 hover:decoration-4"
            >
              后台服务生成签名例子
            </a>
          </h2>

          <div className="mb-6">
            <label htmlFor="productName" className="block text-gray-700 text-sm font-bold mb-2">商品名称：</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <SignatureComponent onSave={handleSaveSignature} />
          {signatureImage && <ReceiptWithSignature signatureImage={signatureImage} productName={productName} />}
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">WiFi 打印示例</h2>
          <p className="text-gray-600 mb-4">
            code:
            <code className="bg-gray-200 rounded p-1 text-sm">
              const printer = await ipp.Printer(&quot;http://192.168.2.148:9100&quot;)  //替换为你的打印机IP
            </code>
          </p>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <div>
            <h1>Bluetooth Printer Page</h1>
            {/* <BluetoothPrinter /> */}
          </div>
        </section>
      </div>
    </main>

  );
};

export default App;