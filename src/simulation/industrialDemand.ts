// we'll look to expand this out in future but for now
// categorise industries by three types:
//    light - low polluting
//    heavy - high polluting
//    high tech - lowest pollution, requires high education

export interface IndustrialDemand {
  light: number
  heavy: number
  highTech: number
}

export interface Demand {
  industrial: IndustrialDemand
}

export function getExternalDemand(time: number): Demand {
  return { industrial: { light: 100, heavy: 2, highTech: 0 } }
}
