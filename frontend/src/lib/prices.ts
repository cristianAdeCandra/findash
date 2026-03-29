// ============================================================
// lib/prices.ts — Real-time price fetching
// Sources:
//   Kripto    → CoinGecko API (free, no key needed)
//   Emas      → goldprice.org API
//   Saham IDX → Yahoo Finance via query2.finance.yahoo.com
//   Reksa Dana → OJK / BAPEPAM via reksadanaku proxy
// ============================================================

export interface PriceData {
  kode: string
  nama: string
  harga_idr: number
  change_24h: number
  source: string
  updated_at: string
}

// ── IDR conversion via frankfurter (free) ───────────────────
async function getUsdIdr(): Promise<number> {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR', {
      next: { revalidate: 3600 },
    })
    const d = await r.json()
    return d.rates.IDR ?? 15800
  } catch {
    return 15800 // fallback
  }
}

// ── CRYPTO — CoinGecko (free, no API key) ───────────────────
const COIN_MAP: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin',
  SOL: 'solana', ADA: 'cardano', DOGE: 'dogecoin',
  XRP: 'ripple', USDT: 'tether', DOT: 'polkadot', AVAX: 'avalanche-2',
}

export async function getCryptoPrice(kode: string): Promise<PriceData | null> {
  const coinId = COIN_MAP[kode.toUpperCase()]
  if (!coinId) return null
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=idr&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    )
    if (!r.ok) return null
    const d = await r.json()
    const coin = d[coinId]
    if (!coin) return null
    return {
      kode: kode.toUpperCase(),
      nama: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      harga_idr: coin.idr,
      change_24h: coin.idr_24h_change ?? 0,
      source: 'CoinGecko',
      updated_at: new Date().toISOString(),
    }
  } catch { return null }
}

// ── EMAS — goldprice.org (free) ──────────────────────────────
export async function getEmasPrice(): Promise<PriceData | null> {
  try {
    const usdIdr = await getUsdIdr()
    // goldprice.org returns price per troy ounce in USD
    const r = await fetch(
      'https://data-asg.goldprice.org/dbXRates/USD',
      { next: { revalidate: 300 } }
    )
    if (!r.ok) return null
    const d = await r.json()
    const pricePerOzUsd = d.items?.[0]?.xauPrice ?? 0
    // Convert to per gram IDR  (1 troy oz = 31.1035 grams)
    const pricePerGramIdr = (pricePerOzUsd / 31.1035) * usdIdr
    return {
      kode: 'XAU',
      nama: 'Emas (per gram)',
      harga_idr: Math.round(pricePerGramIdr),
      change_24h: 0,
      source: 'GoldPrice.org',
      updated_at: new Date().toISOString(),
    }
  } catch { return null }
}

// ── SAHAM IDX — Yahoo Finance ────────────────────────────────
export async function getSahamPrice(ticker: string): Promise<PriceData | null> {
  // IDX tickers need .JK suffix on Yahoo Finance
  const yfTicker = ticker.toUpperCase().endsWith('.JK')
    ? ticker.toUpperCase()
    : `${ticker.toUpperCase()}.JK`
  try {
    const r = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${yfTicker}?interval=1d&range=2d`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 },
      }
    )
    if (!r.ok) return null
    const d = await r.json()
    const meta = d?.chart?.result?.[0]?.meta
    if (!meta) return null
    const harga = meta.regularMarketPrice ?? 0
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? harga
    const change24h = prevClose > 0 ? ((harga - prevClose) / prevClose) * 100 : 0
    return {
      kode: ticker.toUpperCase(),
      nama: meta.shortName ?? ticker.toUpperCase(),
      harga_idr: Math.round(harga),
      change_24h: parseFloat(change24h.toFixed(2)),
      source: 'Yahoo Finance',
      updated_at: new Date().toISOString(),
    }
  } catch { return null }
}

// ── REKSA DANA — OJK NAB via reksa dana open data ───────────
export async function getReksaDanaPrice(kode: string): Promise<PriceData | null> {
  try {
    // Using Bareksa public API for mutual fund NAB
    const r = await fetch(
      `https://www.bareksa.com/api/fund/detail?slug=${encodeURIComponent(kode.toLowerCase())}`,
      { next: { revalidate: 3600 } }
    )
    if (!r.ok) return null
    const d = await r.json()
    const fund = d?.data
    if (!fund) return null
    return {
      kode: kode.toUpperCase(),
      nama: fund.name ?? kode,
      harga_idr: fund.nav ?? 0,
      change_24h: fund.oneDay ?? 0,
      source: 'Bareksa',
      updated_at: new Date().toISOString(),
    }
  } catch { return null }
}

// ── UNIVERSAL PRICE FETCHER ──────────────────────────────────
export async function getPrice(kode: string, jenis: string): Promise<PriceData | null> {
  switch (jenis.toLowerCase()) {
    case 'kripto':     return getCryptoPrice(kode)
    case 'emas':       return getEmasPrice()
    case 'saham':      return getSahamPrice(kode)
    case 'reksa dana': return getReksaDanaPrice(kode)
    default:           return getSahamPrice(kode)
  }
}

// ── BATCH PRICE FETCHER ──────────────────────────────────────
export async function getBatchPrices(
  items: Array<{ kode: string; jenis: string }>
): Promise<Record<string, PriceData>> {
  const results = await Promise.allSettled(
    items.map(item => getPrice(item.kode, item.jenis))
  )
  const out: Record<string, PriceData> = {}
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      out[items[i].kode] = r.value
    }
  })
  return out
}
