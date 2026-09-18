export function formatDateAr(iso: string): string {
  return new Date(iso).toLocaleDateString("ar-KW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** مدة الخدمة بالسنوات، محسوبة من تاريخ التعيين. */
export function yearsOfService(hireDate: string, now = new Date()): number {
  const start = new Date(hireDate);
  let years = now.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(0, years);
}

/** عدد الأيام شامل يومي البداية والنهاية. */
export function inclusiveDays(startDate: string, endDate: string): number {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}
