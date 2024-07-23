
import React, { useRef, useEffect, useState } from 'react';

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
        <div className='flex flex-col gap-1'>
            <canvas
                ref={canvasRef}
                className="w-96 h-32 border-2 border-gray-300 rounded-lg shadow-sm hover:border-blue-500 transition-colors duration-300 touch-none"
                style={{ touchAction: 'none' }}
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105" onClick={handleSave}>保存签名</button>
        </div>
    );
};

export default SignatureComponent;