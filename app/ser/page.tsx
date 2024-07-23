//@ts-nocheck
'use client'
import { useCallback, useState } from 'react';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';


import SignatureComponent from '../component/SignatureComponent';
import ReceiptWithSignature from '../component/ReceiptWithSignature';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};

const resizeObserverOptions = {};

const maxWidth = 800;

const PDFFile = File | null;

export default function Sample() {
    const [file, setFile] = useState < PDFFile > (null);
    const [numPages, setNumPages] = useState < number > (0);
    const [containerRef, setContainerRef] = useState < HTMLElement | null > (null);
    const [containerWidth, setContainerWidth] = useState < number > (700);

    const onResize = useCallback < ResizeObserverCallback > ((entries) => {
        const [entry] = entries;

        if (entry) {
            setContainerWidth(entry.contentRect.width);
        }
    }, []);

    useResizeObserver(containerRef, resizeObserverOptions, onResize);

    const onFileChange = (event) => {
        const { files } = event.target;
        const nextFile = files?.[0];
        if (nextFile) {
            setFile(nextFile);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePrint = async () => {
        setFile("http://127.0.0.1:8080/api/reports/down");
    };

    const dataURLToBlob = (dataURL) => {
        const byteString = atob(dataURL.split(',')[1]);
        const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const prviewSign = async () => {
        if (signatureImage) {

            const fileBlob = dataURLToBlob(signatureImage);
            const formData = new FormData();
            formData.append('file', fileBlob, 'signature.png');



            try {
                const response = await fetch('http://127.0.0.1:8080/api/reports/sign', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to generate signed report');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setFile(url);
            } catch (error) {
                console.error('Error generating signed report:', error);
                // 处理错误，例如显示错误消息给用户
            }
        }
    };


    const [signatureImage, setSignatureImage] = useState(null);
    const handleSaveSignature = (image) => {
        setSignatureImage(image);
    };


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
            <h1 className="text-3xl font-bold mb-6">后台处理电子签名例子</h1>
            <div className="bg-white shadow-md rounded-lg p-6 w-11/12 max-w-4xl ">
                <div className="mb-4">
                    <label htmlFor="file" className="mb-2 font-medium text-gray-700">Load from file:</label>
                    <input onChange={onFileChange} type="file" className="mb-4 border border-gray-300 p-2 rounded" />

                </div>
                <div className="border border-gray-300 rounded-lg p-4 my-2 flex flex-col ">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 mb-4"
                    >
                        预览后端签名视图
                    </button>
                    <a
                        target='_blank'
                        href='http://127.0.0.1:8080/api/reports/down'
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        下载
                    </a>
                </div>

                <div className="border border-gray-300 rounded-lg p-4 my-2  gap-1  ">
                    <div>
                        <label htmlFor="productName">电子签名：</label>
                    </div>
                    <SignatureComponent onSave={handleSaveSignature} />
                    {signatureImage && <ReceiptWithSignature signatureImage={signatureImage} />}

                    {signatureImage && <button
                        onClick={prviewSign}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:scale-105 mb-4"
                    >
                        签名预览
                    </button>}
                </div>

                <div className="border border-gray-300 rounded-lg p-4" ref={containerRef}>
                    {file && (
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                            {Array.from(new Array(numPages), (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                                />
                            ))}
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
}
