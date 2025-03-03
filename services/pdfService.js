const PdfPrinter = require('pdfmake');
const path = require('path');
const fs = require('fs');

const fonts = {
    Roboto: {
        normal: path.join(__dirname, '../public/fonts/AfacadFlux.ttf'),
        bold: path.join(__dirname, '../public/fonts/AfacadFlux-Bold.ttf'),
    }
};

const printer = new PdfPrinter(fonts);

const generatePDF = (orders, totalOrderAmount, discountAmount, start, end) => {
    if(start && end){
        console.log(start)
        const dateText = `From: ${start.toISOString().split('T')[0]}  To: ${end.toISOString().split('T')[0]}`
        return new Promise((resolve, reject) => {
            const logoPath = path.join(__dirname, '../public/images', 'logo.png');
            const docDefinition = {
                content: [
                    {
                        image: logoPath,
                        width: 50,
                        alignment: 'center',
                        margin: [0, 0, 0, 10]
                    },
                    { text: 'Sales Report', style: 'header' },
                    { text: dateText , margin: [0, 10, 0, 10] },

                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                ['S.No', 'Name', 'Delivery Date', 'No of Products', 'Total Cost', 'Payment Method'],
                                ...orders.map((order, index) => [
                                    index + 1,
                                    order.fullName || 'N/A',
                                    order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : 'N/A',
                                    order.products ? order.products.length : 0,
                                    order.priceDetails && order.priceDetails.total ? order.priceDetails.total.toFixed(2) : '0.00',
                                    order.paymentMethod || 'N/A'
                                ])
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },

                    {
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [{ text: 'Total Order Amount', bold: true, alignment: 'left' }, { text: totalOrderAmount, bold: true }],
                                [{ text: 'Discount Amount', bold: true, alignment: 'left' }, { text: discountAmount, bold: true }]
                            ]
                        },
                        margin: [0, 10, 0, 0]
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, alignment: 'center' }
                }
            };
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const pdfPath = path.join(__dirname, '../public', 'generated.pdf');
            const writeStream = fs.createWriteStream(pdfPath);
            pdfDoc.pipe(writeStream);
            pdfDoc.end();
            writeStream.on('finish', () => resolve(pdfPath));
            writeStream.on('error', reject);
        });
    } else {
        return new Promise((resolve, reject) => {
            const logoPath = path.join(__dirname, '../public/images', 'logo.png');
            const docDefinition = {
                content: [
                    {
                        image: logoPath,
                        width: 50,
                        alignment: 'center',
                        margin: [0, 0, 0, 10]
                    },

                    { text: 'Sales Report', style: 'header', margin: [0, 10, 0, 10]  },

                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                ['S.No', 'Name', 'Delivery Date', 'No of Products', 'Total Cost', 'Payment Method'],
                                ...orders.map((order, index) => [
                                    index + 1,
                                    order.fullName || 'N/A',
                                    order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : 'N/A',
                                    order.products ? order.products.length : 0,
                                    order.priceDetails && order.priceDetails.total ? order.priceDetails.total.toFixed(2) : '0.00',
                                    order.paymentMethod || 'N/A'
                                ])
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },

                    {
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [{ text: 'Total Order Amount', bold: true, alignment: 'left' }, { text: totalOrderAmount, bold: true }],
                                [{ text: 'Discount Amount', bold: true, alignment: 'left' }, { text: discountAmount, bold: true }]
                            ]
                        },
                        margin: [0, 10, 0, 0]
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, alignment: 'center' }
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const pdfPath = path.join(__dirname, '../public', 'generated.pdf');
            const writeStream = fs.createWriteStream(pdfPath);

            pdfDoc.pipe(writeStream);
            pdfDoc.end();

            writeStream.on('finish', () => resolve(pdfPath));
            writeStream.on('error', reject);
        });
    }
};

module.exports = { generatePDF };
