const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const inputHtml = fs.readFileSync(path.join(__dirname, '../report_preview.html'), 'utf-8');

const styledHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Báo cáo Kỹ thuật Mini-Project 1 - Nguyễn Thị Huyền - 23IT110</title>
<style>
  @page {
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    font-size: 13px;
    max-width: 840px;
    margin: 0 auto;
    padding: 0;
  }
  h1 {
    font-size: 18px;
    color: #0f172a;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 0;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  h2 {
    font-size: 14px;
    color: #0369a1;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 8px;
  }
  h3 {
    font-size: 13px;
    color: #0f172a;
    margin-top: 12px;
    margin-bottom: 6px;
  }
  p {
    margin: 5px 0;
  }
  hr {
    border: 0;
    border-top: 1px dashed #cbd5e1;
    margin: 14px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 11.5px;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 8px 10px;
    border-radius: 5px;
    font-size: 10.5px;
    line-height: 1.35;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 11px;
    background: #f1f5f9;
    padding: 2px 4px;
    border-radius: 4px;
    color: #0369a1;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }
  ul, ol {
    margin: 5px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 3px;
  }
  a {
    color: #0284c7;
    text-decoration: none;
  }
</style>
</head>
<body>
${inputHtml}
</body>
</html>`;

const styledPath = path.join(__dirname, '../report_styled.html');
fs.writeFileSync(styledPath, styledHtml);
console.log('Written report_styled.html');

const pdfPath = path.join(__dirname, '../Mini-Project-1-Report-23IT110.pdf');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${styledPath}"`);
  console.log('Generated PDF:', pdfPath);
} catch (e) {
  console.error('Edge print-to-pdf error:', e);
}
