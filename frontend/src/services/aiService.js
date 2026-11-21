import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { getMedicines } from "./inventoryService.js";
import { daysUntilExpiry } from "../utils/stockCalculations.js";

const apiUrl = (
  import.meta.env.VITE_AI_API_URL || "http://localhost:8001"
).replace(/\/$/, "");

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateString(value) {
  if (!value) return null;
  const date =
    value?.toDate instanceof Function ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

async function loadInventoryContext() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to view AI insights.");

  const [medicines, profileSnapshot] = await Promise.all([
    getMedicines(),
    getDoc(doc(db, "users", user.uid)).catch(() => null),
  ]);
  const profile = profileSnapshot?.exists() ? profileSnapshot.data() : {};
  const clinicName = profile.clinic || user.displayName || "My clinic";

  return {
    clinicId: user.uid,
    clinicName,
    medicines: medicines.map((medicine) => {
      const history = (
        Array.isArray(medicine.usageHistory) ? medicine.usageHistory : []
      )
        .map((point) => ({
          date: toDateString(point.date),
          units_dispensed: Number(point.units_dispensed ?? point.unitsDispensed),
        }))
        .filter(
          (point) =>
            point.date &&
            Number.isFinite(point.units_dispensed) &&
            point.units_dispensed >= 0,
        );

      return {
        medicine_id: medicine.id,
        medicine_name: medicine.medicineName || "Unnamed medicine",
        clinic_id: user.uid,
        clinic_name: clinicName,
        current_stock: Math.max(0, Number(medicine.quantity) || 0),
        average_daily_usage: Math.max(
          0,
          Number(medicine.averageDailyUsage) || 0,
        ),
        lead_time_days:
          Number.isInteger(Number(medicine.leadTimeDays)) &&
          Number(medicine.leadTimeDays) > 0
            ? Number(medicine.leadTimeDays)
            : undefined,
        history,
        batch_code: medicine.batchNumber || medicine.id,
        expiry_date: toDateString(medicine.expiryDate),
      };
    }),
  };
}

function buildLocalForecast(context, horizonDays) {
  const results = context.medicines.map((item) => {
    const daily = item.average_daily_usage || 0;
    const horizonDemand = Math.round(daily * horizonDays * 10) / 10;
    const daysToStockout =
      daily > 0 ? Math.round((item.current_stock / daily) * 10) / 10 : null;
    const leadTime = item.lead_time_days || 7;
    const recommendedLevel = Math.ceil(daily * (horizonDays + leadTime));

    let risk = "Low";
    if (
      item.current_stock <= 10 ||
      (daysToStockout !== null && daysToStockout <= 7)
    ) {
      risk = "High";
    } else if (
      item.current_stock <= 25 ||
      (daysToStockout !== null && daysToStockout <= horizonDays)
    ) {
      risk = "Medium";
    }

    return {
      medicine_id: item.medicine_id,
      medicine_name: item.medicine_name,
      clinic_id: item.clinic_id,
      clinic_name: item.clinic_name,
      current_stock: item.current_stock,
      predicted_daily_demand: daily,
      predicted_horizon_demand: horizonDemand,
      days_until_stockout: daysToStockout,
      stockout_risk: risk,
      recommended_level: Math.max(recommendedLevel, item.current_stock),
    };
  });

  const highRisk = results.filter((r) => r.stockout_risk === "High");
  const mostUrgent = [...results]
    .filter((r) => r.days_until_stockout != null)
    .sort((a, b) => a.days_until_stockout - b.days_until_stockout)[0];

  return {
    horizon_days: horizonDays,
    high_risk_count: highRisk.length,
    headline_alert: mostUrgent
      ? `${context.clinicName} may run out of ${mostUrgent.medicine_name} in ${Math.max(1, Math.round(mostUrgent.days_until_stockout))} days`
      : null,
    results,
  };
}

function buildLocalExpiryInsights(context) {
  const batches = context.medicines
    .filter((medicine) => medicine.expiry_date)
    .map((medicine) => {
      const days = daysUntilExpiry(medicine.expiry_date) ?? 365;
      const daily = medicine.average_daily_usage || 0;
      const expectedConsumption = days > 0 ? Math.floor(daily * days) : 0;
      const estimatedWaste =
        days < 0
          ? medicine.current_stock
          : Math.max(0, medicine.current_stock - expectedConsumption);

      let risk = "Low";
      let action = "Monitor normally under FEFO dispensing.";
      if (days < 0) {
        risk = "High";
        action = "Quarantine and remove expired batch immediately.";
      } else if (days <= 30) {
        risk = "High";
        action =
          estimatedWaste > 0
            ? "Prioritise dispensing or transfer surplus to a high-demand clinic."
            : "Prioritise dispensing first (FEFO).";
      } else if (days <= 60) {
        risk = "Medium";
        action = "Schedule FEFO rotation and review clinic usage rate.";
      }

      return {
        batch_code: medicine.batch_code,
        medicine_name: medicine.medicine_name,
        days_until_expiry: days,
        estimated_waste_units: estimatedWaste,
        expiry_risk: risk,
        recommended_action: action,
      };
    })
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

  const nearExpiryCount = batches.filter(
    (batch) => batch.days_until_expiry <= 30,
  ).length;

  return {
    near_expiry_count: nearExpiryCount,
    batches,
    transfer_suggestions: [],
  };
}

async function post(path, payload) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : `AI request failed (${response.status}).`;
    throw new Error(detail);
  }
  return response.json();
}

export async function getForecast({ horizon_days: horizonDays = 14 } = {}) {
  const context = await loadInventoryContext();
  if (context.medicines.length === 0) {
    return {
      horizon_days: horizonDays,
      high_risk_count: 0,
      headline_alert: null,
      results: [],
    };
  }
  try {
    return await post("/api/v1/ai/forecast", {
      horizon_days: horizonDays,
      items: context.medicines.map(
        ({
          medicine_id,
          medicine_name,
          clinic_id,
          clinic_name,
          current_stock,
          average_daily_usage,
          lead_time_days,
          history,
        }) => ({
          medicine_id,
          medicine_name,
          clinic_id,
          clinic_name,
          current_stock,
          average_daily_usage,
          lead_time_days,
          history,
        }),
      ),
    });
  } catch {
    return buildLocalForecast(context, horizonDays);
  }
}

export async function getExpiryInsights() {
  const context = await loadInventoryContext();
  const batches = context.medicines
    .filter((medicine) => medicine.expiry_date)
    .map((medicine) => ({
      batch_code: medicine.batch_code,
      medicine_id: medicine.medicine_id,
      medicine_name: medicine.medicine_name,
      clinic_id: context.clinicId,
      clinic_name: context.clinicName,
      quantity: medicine.current_stock,
      expiry_date: medicine.expiry_date,
      avg_daily_usage: medicine.average_daily_usage,
    }));

  if (batches.length === 0) {
    return { near_expiry_count: 0, batches: [], transfer_suggestions: [] };
  }

  try {
    let stockoutRisks = {};
    try {
      const forecast = await getForecast();
      stockoutRisks = Object.fromEntries(
        forecast.results
          .filter((item) => item.days_until_stockout != null)
          .map((item) => [
            `${item.clinic_id}:${item.medicine_id}`,
            item.days_until_stockout,
          ]),
      );
    } catch {
      // Expiry analysis remains useful if demand forecasting is unavailable.
    }

    return await post("/api/v1/ai/expiry-insights", {
      as_of_date: localToday(),
      near_expiry_window_days: 30,
      batches,
      clinic_stockout_risks: stockoutRisks,
    });
  } catch {
    return buildLocalExpiryInsights(context);
  }
}
