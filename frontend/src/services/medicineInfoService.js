const aiApiUrl = (
  import.meta.env.VITE_AI_API_URL || "http://localhost:8001"
).replace(/\/$/, "");

const infoCache = new Map();

function normalizeMedicineQuery(name) {
  return String(name || "")
    .replace(
      /\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|%|units?|tablets?|capsules?)(\/\d*(\.\d+)?\s*(mg|mcg|g|ml|iu)?)?\b/gi,
      "",
    )
    .replace(
      /\b(injection|inhaler|tablet|tablets|capsule|capsules|syrup|suspension|solution|cream|ointment|drops|oral|kits?)\b/gi,
      "",
    )
    .replace(/[/()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimDescription(text, maxSentences = 3) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return cleaned.slice(0, 320);
  return sentences.slice(0, maxSentences).join(" ").trim();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) return null;
  return res.json();
}

async function findArticleProductPhoto(articleTitle, originalName) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    articleTitle,
  )}&generator=images&gimlimit=25&prop=imageinfo&iiprop=url|mime|dimensions&iiurlwidth=640&format=json&origin=*`;

  const data = await fetchJson(url);
  const pages = Object.values(data?.query?.pages || {});

  const excludePattern =
    /(skeletal|structure|3d|xtal|formula|ball|stick|icon|logo|symbol|flag|commons|edit|padlock|question|ambox|star|wiki|enantiomer|isomer|metabolism|pathway|synthesis|mechanism|portrait|flower|plant|leaf|galega|axelrod|diagram|chart|graph|map|signature)/i;
  const pharmaPattern =
    /(tablet|capsule|pill|pack|box|vial|inhaler|bottle|syringe|blister|medicine|drug|mg|dose|panadol|tylenol|ventolin|sumamed|ampoule|sachet|cream|drop)/i;

  const keywords = `${articleTitle} ${originalName}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);

  const ranked = pages
    .map((page) => {
      const title = page.title || "";
      const info = page.imageinfo?.[0];
      if (
        !info?.thumburl ||
        !/image\/(jpeg|webp|png)/.test(info.mime || "") ||
        excludePattern.test(title) ||
        (info.width || 0) < 180
      ) {
        return null;
      }

      const lowerTitle = title.toLowerCase();
      let score = 0;
      if (pharmaPattern.test(lowerTitle)) score += 6;
      if (keywords.some((kw) => lowerTitle.includes(kw))) score += 4;
      if (/image\/jpeg/.test(info.mime)) score += 2;
      return { score, url: info.thumburl };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.url || null;
}

async function lookupViaOnlineReference(medicineName) {
  const cleaned = normalizeMedicineQuery(medicineName);
  const firstWord = cleaned.split(" ")[0];
  const searchTerms = Array.from(
    new Set([cleaned, firstWord].filter(Boolean)),
  );

  for (const term of searchTerms) {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${term} medication`,
    )}&srlimit=3&format=json&origin=*`;
    const searchData = await fetchJson(searchUrl);
    const hits = searchData?.query?.search || [];

    const titles = Array.from(
      new Set([term, ...hits.map((item) => item.title)].filter(Boolean)),
    );

    for (const title of titles) {
      const summary = await fetchJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          title.replace(/ /g, "_"),
        )}`,
      );
      if (!summary || summary.type === "disambiguation" || !summary.extract) {
        continue;
      }

      const productPhoto =
        (await findArticleProductPhoto(summary.title, medicineName)) ||
        summary.originalimage?.source ||
        summary.thumbnail?.source ||
        null;

      return {
        name: medicineName,
        matchedTitle: summary.title,
        description: trimDescription(summary.extract, 3),
        imageUrl: productPhoto,
      };
    }
  }

  return null;
}

export async function getMedicineProductInfo(medicineName) {
  const key = String(medicineName || "").trim().toLowerCase();
  if (!key) return null;
  if (infoCache.has(key)) return infoCache.get(key);

  // Try AI service endpoint if running and available
  try {
    const response = await fetch(`${aiApiUrl}/api/v1/ai/medicine-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicine_name: medicineName }),
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload?.description || payload?.image_url) {
        const result = {
          name: medicineName,
          matchedTitle: payload.title || medicineName,
          description: trimDescription(payload.description, 3),
          imageUrl: payload.image_url || null,
        };
        infoCache.set(key, result);
        return result;
      }
    }
  } catch {
    // Fall back to direct online medicine reference lookup.
  }

  const onlineResult = await lookupViaOnlineReference(medicineName);
  if (onlineResult) {
    infoCache.set(key, onlineResult);
  }
  return onlineResult;
}
