'use client';

import React, { useRef, useState } from 'react';
import { Order } from '../types';
import { Logo } from './Logo';
import { Printer, Download, CheckCircle2, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptViewProps {
  order: Order;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ order }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = () => {
    try {
      if (!receiptRef.current) {
        window.print();
        return;
      }

      // Try printing via isolated hidden iframe for cross-browser & iframe reliability
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      
      document.body.appendChild(printIframe);
      
      const contentWindow = printIframe.contentWindow;
      if (!contentWindow) {
        window.print();
        return;
      }

      const receiptHtml = receiptRef.current.outerHTML;

      contentWindow.document.open();
      contentWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>FOOD MART Receipt #${order.orderId}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { background: white; font-family: monospace; padding: 20px; color: #242424; }
              @media print {
                body { padding: 0; margin: 0; }
              }
            </style>
          </head>
          <body>
            ${receiptHtml}
            <script>
              setTimeout(() => {
                window.focus();
                window.print();
              }, 400);
            </script>
          </body>
        </html>
      `);
      contentWindow.document.close();

      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 4000);
    } catch (e) {
      console.warn('Fallback to standard window.print()', e);
      window.print();
    }
  };

  const generateFallbackPDF = (ord: Order) => {
    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(232, 72, 63); // #E8483F
      pdf.text('FOOD MART', 105, 20, { align: 'center' });
      
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Official POS Sales Transaction Slip', 105, 27, { align: 'center' });
      pdf.text('Qadadfi Park, Muridke, Punjab, Pakistan | +92 3080142899', 105, 33, { align: 'center' });
      pdf.text('Email: ay8880625@gmail.com', 105, 38, { align: 'center' });
      
      pdf.setDrawColor(200, 200, 200);
      pdf.line(15, 42, 195, 42);
      
      // Customer & Order Info
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Order ID: #${ord.orderId}`, 15, 50);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date(ord.createdAt).toLocaleString()}`, 15, 56);
      pdf.text(`Customer Name: ${ord.customerName}`, 15, 62);
      pdf.text(`Phone: ${ord.phone}`, 15, 68);
      pdf.text(`Email: ${ord.customerEmail}`, 15, 74);
      pdf.text(`Address: ${ord.address}, ${ord.city}`, 15, 80);
      
      pdf.line(15, 85, 195, 85);
      
      // Items Header
      pdf.setFont('helvetica', 'bold');
      pdf.text('ITEM', 15, 92);
      pdf.text('QTY', 120, 92);
      pdf.text('UNIT PRICE', 145, 92);
      pdf.text('TOTAL', 175, 92);
      
      pdf.line(15, 95, 195, 95);
      
      let y = 102;
      pdf.setFont('helvetica', 'normal');
      ord.items.forEach((item) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(item.name.substring(0, 42), 15, y);
        pdf.text(`${item.quantity}`, 120, y);
        pdf.text(`Rs.${item.price}`, 145, y);
        pdf.text(`Rs.${item.totalPrice}`, 175, y);
        y += 8;
      });
      
      pdf.line(15, y, 195, y);
      y += 8;
      
      // Totals
      pdf.text(`Subtotal: Rs. ${ord.subtotal}`, 140, y);
      y += 6;
      if (ord.discount > 0) {
        pdf.text(`Discount: - Rs. ${ord.discount}`, 140, y);
        y += 6;
      }
      pdf.text(`Delivery Fee: ${ord.deliveryFee === 0 ? 'FREE' : 'Rs. ' + ord.deliveryFee}`, 140, y);
      y += 6;
      pdf.text(`Sales Tax (0%): Rs. 0`, 140, y);
      y += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(232, 72, 63);
      pdf.text(`GRAND TOTAL: Rs. ${ord.total}`, 140, y);
      
      y += 15;
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for shopping at FOOD MART!', 105, y, { align: 'center' });
      y += 5;
      pdf.text('Served by TEAM 5 IDIOTS (M.Ahmad, Muavia, Bilal, Muzammil, Ahmad)', 105, y, { align: 'center' });
      
      pdf.save(`FOOD-MART-Receipt-${ord.orderId}.pdf`);
    } catch (err) {
      console.error('Fallback PDF generation error:', err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const element = receiptRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FOOD-MART-Receipt-${order.orderId}.pdf`);
    } catch (err) {
      console.warn('html2canvas canvas creation failed, using text-based PDF fallback', err);
      generateFallbackPDF(order);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Action Buttons (Hidden when printing) */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs print:hidden">
        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Official POS Sales Slip
          </span>
          <p className="text-xs text-neutral-500 mt-1">Order #{order.orderId}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-black disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8483F] hover:bg-[#C93630] text-white shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Slip
          </button>
        </div>
      </div>

      {/* POS TRANSACTION SLIP CARD */}
      <div 
        ref={receiptRef}
        className="bg-white border-2 border-neutral-300 rounded-2xl p-6 sm:p-8 shadow-md font-mono text-xs text-neutral-800 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full"
      >
        {/* HEADER */}
        <div className="text-center space-y-2 border-b-2 border-dashed border-neutral-300 pb-5">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <p className="font-sans text-xs font-bold text-neutral-600 uppercase tracking-widest pt-1">
            Official POS Sales Transaction Slip
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            Qadadfi Park, Muridke, Punjab, Pakistan
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">
            Phone: +92 3080142899 | Email: ay8880625@gmail.com
          </p>
        </div>

        {/* METADATA */}
        <div className="space-y-1.5 text-[11px] border-b border-neutral-200 pb-4">
          <div className="flex justify-between">
            <span className="text-neutral-500">Transaction ID:</span>
            <span className="font-bold text-neutral-900">{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Date & Time:</span>
            <span className="font-medium text-neutral-800">
              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Customer Name:</span>
            <span className="font-bold text-neutral-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Customer Email:</span>
            <span className="font-medium text-neutral-800">{order.customerEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Phone Number:</span>
            <span className="font-medium text-neutral-800">{order.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Delivery Address:</span>
            <span className="font-medium text-neutral-800 text-right max-w-[200px] truncate">{order.address}, {order.city}</span>
          </div>
        </div>

        {/* ITEMIZED TABLE */}
        <div className="space-y-3">
          <p className="font-bold uppercase tracking-wider text-[11px] text-neutral-500 border-b border-neutral-200 pb-1">
            Itemized Purchase Details
          </p>
          
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-neutral-200 font-bold text-neutral-600">
                <th className="py-1">ITEM</th>
                <th className="py-1 text-center">QTY</th>
                <th className="py-1 text-right">UNIT</th>
                <th className="py-1 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-1 font-sans">
                    <p className="font-bold text-neutral-900 leading-tight">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">SKU: {item.sku}</p>
                  </td>
                  <td className="py-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-2 text-right">Rs.{item.price}</td>
                  <td className="py-2 text-right font-bold text-[#E8483F]">Rs.{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CALCULATION SUMMARY */}
        <div className="border-t-2 border-dashed border-neutral-300 pt-4 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-neutral-600">
            <span>Items Subtotal:</span>
            <span className="font-bold text-neutral-900">Rs. {order.subtotal}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Savings Discount:</span>
              <span>- Rs. {order.discount}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Delivery Fee:</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}</span>
          </div>

          {/* Tax must strictly be Rs. 0 */}
          <div className="flex justify-between text-neutral-600 font-medium">
            <span>Sales Tax (0%):</span>
            <span className="font-bold text-neutral-900">Rs. 0</span>
          </div>

          <div className="flex justify-between text-sm font-black text-[#E8483F] pt-2 border-t border-neutral-300">
            <span>GRAND TOTAL:</span>
            <span>Rs. {order.total}</span>
          </div>
        </div>

        {/* PAYMENT & STATUS */}
        <div className="bg-neutral-50 p-3 rounded-xl space-y-1 text-[11px] border border-neutral-200">
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment Method:</span>
            <span className="font-bold uppercase text-neutral-900">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Demo Credit Card'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Payment Status:</span>
            <span className="font-bold uppercase text-emerald-600">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Fulfillment Status:</span>
            <span className="font-bold uppercase text-[#E8483F]">{order.orderStatus}</span>
          </div>
        </div>

        {/* FOOTER MANDATE */}
        <div className="text-center pt-2 space-y-1 text-[10px] text-neutral-500 border-t border-dashed border-neutral-300">
          <p className="font-sans font-bold text-neutral-800">Thank you for shopping at FOOD MART!</p>
          <p className="font-sans">"Fresh groceries. Better everyday."</p>
          <p className="pt-2 font-mono text-neutral-600 font-bold">
            Served by TEAM 5 IDIOTS (M.Ahmad, Muavia, Bilal, Muzammil, Ahmad)
          </p>
        </div>

      </div>

    </div>
  );
};
