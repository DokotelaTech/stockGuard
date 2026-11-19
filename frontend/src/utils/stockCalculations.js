export function isLowStock(quantity, minimumQuantity) {
  return Number.isFinite(quantity) && Number.isFinite(minimumQuantity)
    ? quantity <= minimumQuantity
    : false;
}

export function daysUntilExpiry(expiryDate, now = new Date()) {
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.ceil((expiry.getTime() - now.getTime()) / 86_400_000);
}
