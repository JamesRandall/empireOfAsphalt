export interface RCI {
  residential: number
  commercial: number
  industrial: number
}

export interface Simulation {
  population: RCI & { total: number }
  valves: RCI
  valveMaximums: RCI
  valveHistory: RCI[]
  time: {
    clock: number
    lastZoneUpdateAt: number
    lastPowerGridUpdateAt: number
  }
  taxLevel: number
  taxTable: number[]
}

export function zeroRCI() {
  return { residential: 0, commercial: 0, industrial: 0 }
}

export function initialiseSimulation(): Simulation {
  return {
    population: { ...zeroRCI(), total: 0 },
    valves: zeroRCI(),
    valveMaximums: { residential: 2000, commercial: 1500, industrial: 1500 },
    valveHistory: Array.from({ length: 120 }, () => zeroRCI()),
    time: {
      clock: 0.0,
      lastPowerGridUpdateAt: 0.0,
      lastZoneUpdateAt: 0.0,
    },
    taxLevel: 3,
    taxTable: Array.from({ length: 20 }, (_, index) => index),
  }
}
