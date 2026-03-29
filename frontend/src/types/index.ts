// ============================================================
// FinTrack — Global TypeScript Types
// ============================================================

export type Jenis =
  | 'Saham'
  | 'Reksa Dana'
  | 'Obligasi'
  | 'Emas'
  | 'Kripto'
  | 'Deposito'
  | 'Properti'
  | 'Lainnya'

export type Kategori =
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja'
  | 'Kesehatan'
  | 'Hiburan'
  | 'Tagihan & Utilitas'
  | 'Pendidikan'
  | 'Lainnya'

export type Warna = 'green' | 'blue' | 'amber' | 'purple' | 'red'

// ── Database rows ────────────────────────────────────────────
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  currency: string
  created_at: string
  updated_at: string
}

export interface Pengeluaran {
  id: string
  user_id: string
  tanggal: string
  jumlah: number
  kategori: Kategori
  keterangan: string | null
  created_at: string
  updated_at: string
}

export interface Investasi {
  id: string
  user_id: string
  tanggal: string
  jenis: Jenis
  nama: string
  kode_ticker: string | null
  platform: string | null
  modal: number
  harga_beli: number | null
  qty: number | null
  harga_sekarang: number | null
  tgl_update_harga: string | null
  catatan: string | null
  created_at: string
  updated_at: string
  // computed client-side
  nilai_sekarang?: number
  pl?: number
  pl_pct?: number
}

export interface Target {
  id: string
  user_id: string
  bulan: string
  pendapatan: number
  batas_keluar: number
  target_invest: number
  target_tabung: number
  created_at: string
  updated_at: string
}

export interface Tabungan {
  id: string
  user_id: string
  nama: string
  deskripsi: string | null
  target: number
  terkumpul: number
  warna: Warna
  urutan: number
  created_at: string
  updated_at: string
}

export interface HargaCache {
  id: string
  kode: string
  nama: string | null
  jenis: string
  harga: number | null
  harga_idr: number | null
  change_24h: number | null
  updated_at: string
}

// ── API responses ────────────────────────────────────────────
export interface PriceResult {
  kode: string
  nama: string
  harga_idr: number
  change_24h: number
  source: string
  updated_at: string
}

export interface DashboardStats {
  total_pengeluaran_bulan: number
  total_investasi_bulan: number
  saldo_bersih: number
  anggaran_tersisa: number
  total_portofolio: number
  total_pl: number
  target: Target | null
}

// ── Form inputs ──────────────────────────────────────────────
export interface PengeluaranInput {
  tanggal: string
  jumlah: number
  kategori: Kategori
  keterangan: string
}

export interface InvestasiInput {
  tanggal: string
  jenis: Jenis
  nama: string
  kode_ticker: string
  platform: string
  modal: number
  harga_beli: number | null
  qty: number | null
  catatan: string
}

export interface TargetInput {
  pendapatan: number
  batas_keluar: number
  target_invest: number
  target_tabung: number
}

export interface TabunganInput {
  nama: string
  deskripsi: string
  target: number
  terkumpul: number
  warna: Warna
}
