const formatter = new Intl.NumberFormat("vi-VN");

export function formatVnd(amount: number): string {
  return `${formatter.format(amount)} đ`;
}
