const path = require('path')
const ExcelJS = require('exceljs')

exports.generateExcel = async (
  orders,
  totalOrderAmount,
  discountAmount,
  start,
  end
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sales Report')

  // Add Title
  worksheet.mergeCells('A1:L1')
  worksheet.getCell('A1').value = 'Sales Report'
  worksheet.getCell('A1').font = { size: 16, bold: true }
  worksheet.getCell('A1').alignment = { horizontal: 'center' }

  if (start && end) {
    // Date Range
    worksheet.mergeCells('A2:L2')
    if (start.length) {
      worksheet.getCell('A2').value = `From: ${start} To: ${end}`
    } else {
      worksheet.getCell('A2').value =
        `From: ${start.toISOString().split('T')[0]} To: ${end.toISOString().split('T')[0]}`
    }
    worksheet.getCell('A2').alignment = { horizontal: 'center' }
  }

  // Add Empty Row
  worksheet.addRow([])

  // Add Table Header with 2-column span
  worksheet.mergeCells('A4:B4')
  worksheet.getCell('A4').value = 'S.No'
  worksheet.mergeCells('C4:D4')
  worksheet.getCell('C4').value = 'Name'
  worksheet.mergeCells('E4:F4')
  worksheet.getCell('E4').value = 'Delivery Date'
  worksheet.mergeCells('G4:H4')
  worksheet.getCell('G4').value = 'No of Products'
  worksheet.mergeCells('I4:J4')
  worksheet.getCell('I4').value = 'Total Cost'
  worksheet.mergeCells('K4:L4')
  worksheet.getCell('K4').value = 'Payment Method'

  // Apply Header Styles
  const headerRow = worksheet.getRow(4)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  // Add Order Data
  let rowIndex = 5
  orders.forEach((order, index) => {
    worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`)
    worksheet.mergeCells(`C${rowIndex}:D${rowIndex}`)
    worksheet.mergeCells(`E${rowIndex}:F${rowIndex}`)
    worksheet.mergeCells(`G${rowIndex}:H${rowIndex}`)
    worksheet.mergeCells(`I${rowIndex}:J${rowIndex}`)
    worksheet.mergeCells(`K${rowIndex}:L${rowIndex}`)

    // Set Cell Values
    worksheet.getCell(`A${rowIndex}`).value = index + 1
    worksheet.getCell(`C${rowIndex}`).value = order.fullName || 'N/A'
    worksheet.getCell(`E${rowIndex}`).value = order.deliveryDate
      ? order.deliveryDate.toISOString().split('T')[0]
      : 'N/A'
    worksheet.getCell(`G${rowIndex}`).value = order.products
      ? order.products.length
      : 0
    worksheet.getCell(`I${rowIndex}`).value =
      order.priceDetails && order.priceDetails.total
        ? order.priceDetails.total.toFixed(2)
        : '0.00'
    worksheet.getCell(`K${rowIndex}`).value = order.paymentMethod || 'N/A'

    // Align Data Center for Specific Columns
    worksheet.getCell(`A${rowIndex}`).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
    worksheet.getCell(`E${rowIndex}`).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
    worksheet.getCell(`G${rowIndex}`).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }

    rowIndex++
  })

  // Add Empty Row
  worksheet.addRow([])
  rowIndex++

  // === Total Order Amount & Discount Amount Section (Right Aligned) ===
  worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`)
  worksheet.getCell(`A${rowIndex}`).value = 'Total Order Amount:'
  worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'right' }

  worksheet.mergeCells(`I${rowIndex}:L${rowIndex}`)
  worksheet.getCell(`I${rowIndex}`).value = totalOrderAmount
  worksheet.getCell(`I${rowIndex}`).font = { bold: true }

  rowIndex++

  worksheet.mergeCells(`A${rowIndex}:H${rowIndex}`)
  worksheet.getCell(`A${rowIndex}`).value = 'Discount Amount:'
  worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: 'right' }

  worksheet.mergeCells(`I${rowIndex}:L${rowIndex}`)
  worksheet.getCell(`I${rowIndex}`).value = discountAmount
  worksheet.getCell(`I${rowIndex}`).font = {
    bold: true,
    color: { argb: 'FF0000' },
  }

  // Save the file
  const excelPath = path.join(__dirname, '../public', 'Sales_Report.xlsx')
  await workbook.xlsx.writeFile(excelPath)

  return excelPath
}
