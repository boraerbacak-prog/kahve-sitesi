export function tl(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function trDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("tr-TR");
}

export function trDateTime(d: string | Date): string {
  return new Date(d).toLocaleString("tr-TR");
}

export function esc(v: any): string {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function htmlExcel(title: string, headers: string[], rows: string[][]): string {
  const thead = headers.map(h =>
    `<th style="background:#C4724B;color:#fff;padding:8px 12px;font-weight:600;text-align:left;border:1px solid #ddd;white-space:nowrap">${esc(h)}</th>`
  ).join("");
  const tbody = rows.map(r =>
    "<tr>" + r.map(c =>
      `<td style="padding:6px 12px;border:1px solid #ddd">${c}</td>`
    ).join("") + "</tr>"
  ).join("");
  return `<!DOCTYPE html><html><meta charset="utf-8"><body><h2 style="font-family:Arial;color:#333">${esc(title)}</h2><table style="border-collapse:collapse;font-family:Arial;font-size:13px">${thead}${tbody}</table></body></html>`;
}

export function downloadXls(filename: string, html: string) {
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
