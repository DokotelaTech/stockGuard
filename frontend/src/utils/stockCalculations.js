export function isLowStock(quantity, minimumQuantity = 15) {
  const qty = Number(quantity);
  const min = Number(minimumQuantity);
  return Number.isFinite(qty) && Number.isFinite(min) ? qty <= min : false;
}

export function daysUntilExpiry(expiryDate, now = new Date()) {
  if (!expiryDate) return null;
  const raw =
    typeof expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
      ? `${expiryDate}T23:59:59`
      : expiryDate;
  const expiry = new Date(raw);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.ceil((expiry.getTime() - now.getTime()) / 86_400_000);
}

export function getMedicineAlertState(medicine, now = new Date()) {
  const qty = Number(medicine?.quantity ?? 0);
  const days = daysUntilExpiry(medicine?.expiryDate, now);
  const expired = days !== null && days < 0;
  const expiringSoon = days !== null && days >= 0 && days <= 30;
  const expiryWatch = days !== null && days > 30 && days <= 60;
  const criticalStock = qty <= 10;
  const lowStock = qty > 10 && qty <= 25;

  let rowTone = "row-success";
  let status = "Available";

  if (expired) {
    rowTone = "row-danger";
    status = "Expired";
  } else if (expiringSoon) {
    rowTone = "row-danger";
    status = "Expiring Soon";
  } else if (criticalStock) {
    rowTone = "row-danger";
    status = "Critical Stock";
  } else if (expiryWatch) {
    rowTone = "row-warning";
    status = "Expiry Watch";
  } else if (lowStock) {
    rowTone = "row-warning";
    status = "Low Stock";
  }

  return {
    daysUntilExpiry: days,
    expired,
    expiringSoon,
    expiryWatch,
    criticalStock,
    lowStock,
    isNearExpiry: expired || expiringSoon,
    isStockoutRisk:
      criticalStock ||
      lowStock ||
      (Number(medicine?.averageDailyUsage) > 0 &&
        qty / Number(medicine.averageDailyUsage) <= 14),
    rowTone,
    status,
  };
}
