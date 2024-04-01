export const sizes = {
  tile: 32,
}

export const map = {
  movementSpeedTilesPerSecond: sizes.tile * 2,
  maxHeight: 8,
  smoothingIterations: 3,
  unitRenderHeight: sizes.tile / 2,
  maxZoom: 15.0,
  minZoom: 0.1,
}

export const timings = {
  buildSpeedVoxelsPerSecond: 128,
}
