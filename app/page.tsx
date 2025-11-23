"use client";

import { useMemo, useState } from 'react';

type Quantity = 'densite' | 'masse' | 'volume';

type MassUnit = 'kg' | 'g';

type VolumeUnit = 'm3' | 'cm3' | 'L' | 'mL';

type DensityUnit = 'kg/m3' | 'g/cm3';

function toKilograms(value: number, unit: MassUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'kg' ? value : value / 1000;
}

function fromKilograms(valueKg: number, target: MassUnit): number {
  if (!Number.isFinite(valueKg)) return NaN;
  return target === 'kg' ? valueKg : valueKg * 1000;
}

function toCubicMeters(value: number, unit: VolumeUnit): number {
  if (!Number.isFinite(value)) return NaN;
  switch (unit) {
    case 'm3': return value;
    case 'cm3': return value / 1_000_000; // 1 cm? = 1e-6 m?
    case 'L': return value / 1000;        // 1 L = 1e-3 m?
    case 'mL': return value / 1_000_000;  // 1 mL = 1e-6 m?
  }
}

function fromCubicMeters(valueM3: number, target: VolumeUnit): number {
  if (!Number.isFinite(valueM3)) return NaN;
  switch (target) {
    case 'm3': return valueM3;
    case 'cm3': return valueM3 * 1_000_000;
    case 'L': return valueM3 * 1000;
    case 'mL': return valueM3 * 1_000_000;
  }
}

function toKgPerM3(value: number, unit: DensityUnit): number {
  if (!Number.isFinite(value)) return NaN;
  // 1 g/cm? = 1000 kg/m?
  return unit === 'kg/m3' ? value : value * 1000;
}

function fromKgPerM3(value: number, unit: DensityUnit): number {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'kg/m3' ? value : value / 1000;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '';
  // Prefer up to 6 significant digits; falls back to fixed for small/large
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) return n.toExponential(6);
  return Number(n.toPrecision(6)).toString();
}

export default function Page() {
  const [quantity, setQuantity] = useState<Quantity>('densite');

  const [massValue, setMassValue] = useState<string>('');
  const [massUnit, setMassUnit] = useState<MassUnit>('kg');

  const [volumeValue, setVolumeValue] = useState<string>('');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('m3');

  const [densityValue, setDensityValue] = useState<string>('');
  const [densityUnit, setDensityUnit] = useState<DensityUnit>('kg/m3');

  const massKg = useMemo(() => toKilograms(Number(massValue), massUnit), [massValue, massUnit]);
  const volumeM3 = useMemo(() => toCubicMeters(Number(volumeValue), volumeUnit), [volumeValue, volumeUnit]);
  const densityKgM3 = useMemo(() => toKgPerM3(Number(densityValue), densityUnit), [densityValue, densityUnit]);

  const { resultLabel, resultValue, resultUnit } = useMemo(() => {
    if (quantity === 'densite') {
      if (!Number.isFinite(massKg) || !Number.isFinite(volumeM3) || volumeM3 === 0) {
        return { resultLabel: 'Densit?', resultValue: '', resultUnit: densityUnit };
      }
      const densKgM3 = massKg / volumeM3;
      return { resultLabel: 'Densit?', resultValue: formatNumber(fromKgPerM3(densKgM3, densityUnit)), resultUnit: densityUnit };
    }
    if (quantity === 'masse') {
      if (!Number.isFinite(densityKgM3) || !Number.isFinite(volumeM3)) {
        return { resultLabel: 'Masse', resultValue: '', resultUnit: massUnit };
      }
      const massKgOut = densityKgM3 * volumeM3;
      return { resultLabel: 'Masse', resultValue: formatNumber(fromKilograms(massKgOut, massUnit)), resultUnit: massUnit };
    }
    // volume
    if (!Number.isFinite(massKg) || !Number.isFinite(densityKgM3) || densityKgM3 === 0) {
      return { resultLabel: 'Volume', resultValue: '', resultUnit: volumeUnit };
    }
    const volM3Out = massKg / densityKgM3;
    return { resultLabel: 'Volume', resultValue: formatNumber(fromCubicMeters(volM3Out, volumeUnit)), resultUnit: volumeUnit };
  }, [quantity, massKg, volumeM3, densityKgM3, densityUnit, massUnit, volumeUnit]);

  const resetInputs = () => {
    setMassValue('');
    setVolumeValue('');
    setDensityValue('');
  };

  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1>Calcul de densit?</h1>
          <div className="subtitle">Calculez la densit?, la masse ou le volume avec conversions d'unit?s.</div>
        </div>
        <span className="badge">kg/m? ? g/cm? ? L ? mL</span>
      </div>

      <div className="grid" style={{ marginTop: 8 }}>
        <div className="field">
          <label className="label" htmlFor="quantity">Grandeur ? calculer</label>
          <select id="quantity" className="select" value={quantity} onChange={e => setQuantity(e.target.value as Quantity)}>
            <option value="densite">Densit?</option>
            <option value="masse">Masse</option>
            <option value="volume">Volume</option>
          </select>
          <span className="helper">Choisissez la grandeur ? obtenir; renseignez les deux autres.</span>
        </div>

        {quantity === 'densite' && (
          <div className="field">
            <label className="label" htmlFor="density-unit">Unit? de densit?</label>
            <select id="density-unit" className="select" value={densityUnit} onChange={e => setDensityUnit(e.target.value as DensityUnit)}>
              <option value="kg/m3">kg/m?</option>
              <option value="g/cm3">g/cm?</option>
            </select>
          </div>
        )}

        {quantity !== 'masse' && (
          <div className="field">
            <label className="label">Masse</label>
            <div className="row">
              <input className="input" type="number" inputMode="decimal" placeholder="Valeur" value={massValue} onChange={e => setMassValue(e.target.value)} />
              <select className="select" value={massUnit} onChange={e => setMassUnit(e.target.value as MassUnit)}>
                <option value="kg">kg</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>
        )}

        {quantity !== 'volume' && (
          <div className="field">
            <label className="label">Volume</label>
            <div className="row">
              <input className="input" type="number" inputMode="decimal" placeholder="Valeur" value={volumeValue} onChange={e => setVolumeValue(e.target.value)} />
              <select className="select" value={volumeUnit} onChange={e => setVolumeUnit(e.target.value as VolumeUnit)}>
                <option value="m3">m?</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="cm3">cm?</option>
              </select>
            </div>
          </div>
        )}

        {quantity !== 'densite' && (
          <div className="field">
            <label className="label">Densit?</label>
            <div className="row">
              <input className="input" type="number" inputMode="decimal" placeholder="Valeur" value={densityValue} onChange={e => setDensityValue(e.target.value)} />
              <select className="select" value={densityUnit} onChange={e => setDensityUnit(e.target.value as DensityUnit)}>
                <option value="kg/m3">kg/m?</option>
                <option value="g/cm3">g/cm?</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button className="button primary" onClick={() => { /* no-op; live calculation */ }}>
          Calculer
        </button>
        <button className="button ghost" onClick={resetInputs}>R?initialiser</button>
      </div>

      <div className="result">
        <strong>{resultLabel}:</strong> {resultValue ? (<>
          <span style={{ marginLeft: 6 }}>{resultValue}</span>
          <span style={{ marginLeft: 6, color: 'var(--muted)' }}>{resultUnit}</span>
        </>) : <span style={{ marginLeft: 6, color: 'var(--muted)' }}>?</span>}
      </div>

      <div className="helper" style={{ marginTop: 10 }}>
        Rappels: 1 g/cm? = 1000 kg/m? ? 1 L = 0,001 m? ? 1 mL = 1 cm?.
      </div>
    </div>
  );
}
