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
  return { industrial: { light: Math.ceil(time / 14), heavy: 0, highTech: 0 } }
}
