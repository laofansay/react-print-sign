const ReceiptWithSignature = ({ signatureImage }) => {
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
        <div className='flex flex-col gap-1'>
            <h2>回执预览</h2>
            <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px' }}>
                <p><strong>日期时间：</strong> {new Date().toLocaleString()}</p>
                <div>
                    <p><strong>客户签名：</strong></p>
                    <img src={signatureImage} alt="Signature" style={{ width: '100%', maxWidth: '300px' }} />
                </div>
            </div>
        </div>
    );
};
export default ReceiptWithSignature