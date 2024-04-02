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

export function externalIndustrialDemand(year: number): IndustrialDemand {
  return { light: 10, heavy: 2, highTech: 0 }
}
