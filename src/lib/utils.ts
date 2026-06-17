import { LEVEL_THRESHOLDS, POIN_PER_KG } from './constants';

export function getLevel(totalPoin: number): string {
  const level = [...LEVEL_THRESHOLDS]
    .reverse()
    .find((l) => totalPoin >= l.min);
  return level?.nama ?? 'Pemula Hijau';
}

export function getNextLevel(totalPoin: number) {
  const next = LEVEL_THRESHOLDS.find((l) => l.min > totalPoin);
  return next ?? null; // null berarti sudah level tertinggi
}

export function getLevelProgress(totalPoin: number): number {
  const current = [...LEVEL_THRESHOLDS].reverse().find((l) => totalPoin >= l.min)!;
  const next = LEVEL_THRESHOLDS.find((l) => l.min > totalPoin);
  if (!next) return 100;
  return Math.round(((totalPoin - current.min) / (next.min - current.min)) * 100);
}

export function hitungPoin(totalBerat: number): number {
  return Math.floor(totalBerat * POIN_PER_KG);
}

export function hitungCO2(totalKg: number) {
  const co2Kg = totalKg * 2.5;           // kg CO₂ dihemat
  const pohon = co2Kg / 21;              // pohon diselamatkan (1 pohon = 21 kg CO₂/tahun)
  const airLiter = totalKg * 6;          // liter air dihemat (estimasi daur ulang plastik)
  return { co2Kg, pohon, airLiter };
}

export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatAngka(angka: number): string {
  return new Intl.NumberFormat('id-ID').format(angka);
}

export function formatTanggal(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch (error) {
    return dateString;
  }
}

export function formatTanggalJam(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d) + ' WIB';
  } catch (error) {
    return dateString;
  }
}
