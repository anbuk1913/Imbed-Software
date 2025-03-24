const PdfPrinter = require('pdfmake')
const path = require('path')
const fs = require('fs')

const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../public/fonts/AfacadFlux.ttf'),
    bold: path.join(__dirname, '../public/fonts/AfacadFlux-Bold.ttf'),
  },
}

const printer = new PdfPrinter(fonts)

const generateInvoice = async (orderData) => {
  return new Promise((resolve, reject) => {
    const logoPath = path.join(__dirname, '../public/images', 'logo.png')
    const docDefinition = {
      content: [
        {
          image: logoPath,
          width: 40,
          alignment: 'center',
          margin: [0, 0, 0, 0],
        },
        { text: 'IMBED SOFTWARE', style: 'header' },
        { text: 'INVOICE', style: 'subheader' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'FROM\n', style: 'label' },
                { text: 'IMBED SOFTWARE\n', style: 'value' },
                { text: 'No 11, Bharathiyar Street\n', style: 'value' },
                { text: 'Near Gandhi Street\n', style: 'value' },
                { text: 'Karaikudi, Tamil Nadu\n', style: 'value' },
                { text: 'Phone: +91 8148413021\n', style: 'value' },
                {
                  text: 'Email: imbedsoftwareteam@gmail.com\n\n ',
                  style: 'value',
                },
              ],
            },
            {
              width: '*',
              text: [
                { text: 'BILL TO\n', style: 'label' },
                { text: `${orderData.fullName}\n`, style: 'value' },
                {
                  text: `${orderData.address.doorNo}, ${orderData.address.street}\n`,
                  style: 'value',
                },
                {
                  text: `${orderData.address.city}, ${orderData.address.district}\n`,
                  style: 'value',
                },
                { text: `PIN: ${orderData.address.pinCode}\n`, style: 'value' },
                { text: `Phone: +91 ${orderData.phone}\n`, style: 'value' },
                { text: `Email: ${orderData.email}\n `, style: 'value' },
              ],
            },
          ],
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'INVOICE DETAILS\n', style: 'label' },
                { text: `Invoice No: ${orderData._id}\n`, style: 'value' },
                {
                  text: `Invoice Date: ${new Date(orderData.createdAt).toLocaleDateString()}\n`,
                  style: 'value',
                },
                {
                  text: `Due Date: ${new Date(orderData.deliveryDate).toLocaleDateString()}\n`,
                  style: 'value',
                },
                {
                  text: `Payment Method: ${orderData.paymentMethod}\n`,
                  style: 'value',
                },
              ],
            },
          ],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Product Name', 'Quantity', 'Unit Price', 'Total'],
              ...orderData.products.map((product) => [
                product.productName,
                product.quantity,
                `₹${product.productPrice}`,
                `₹${product.productPrice * product.quantity}`,
              ]),
            ],
          },
          margin: [0, 20, 0, 20],
        },
        {
          columns: [
            {
              width: '*',
              text: '',
            },
            {
              width: 'auto',
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Sub Total', style: 'label' },
                    {
                      text: `₹${orderData.priceDetails.subTotal}`,
                      style: 'value',
                    },
                  ],
                  [
                    { text: 'Delivery', style: 'label' },
                    {
                      text: `₹${orderData.priceDetails.delivery}`,
                      style: 'value',
                    },
                  ],
                  [
                    { text: 'GST (18%)', style: 'label' },
                    { text: `₹${orderData.priceDetails.gst}`, style: 'value' },
                  ],
                  [
                    { text: 'Coupon', style: 'label' },
                    {
                      text: `₹${orderData.priceDetails?.couponuser ? orderData.priceDetails.couponuser : 0}`,
                      style: 'value',
                    },
                  ],
                  [
                    { text: 'Total', style: 'label', bold: true },
                    {
                      text: `₹${orderData.priceDetails.total}`,
                      style: 'value',
                      bold: true,
                    },
                  ],
                ],
              },
            },
          ],
        },
        {
          text: 'Thank you for your business!',
          style: 'footer',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 24, bold: true, alignment: 'center' },
        subheader: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 10],
        },
        label: { fontSize: 12, bold: true },
        value: { fontSize: 12 },
        footer: { fontSize: 14, alignment: 'center' },
      },
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const pdfPath = path.join(
      __dirname,
      '../public',
      `invoice_${orderData._id}.pdf`
    )
    const writeStream = fs.createWriteStream(pdfPath)

    pdfDoc.pipe(writeStream)
    pdfDoc.end()

    writeStream.on('finish', () => resolve(pdfPath))
    writeStream.on('error', reject)
  })
}

module.exports = { generateInvoice }
