export interface ControlState {
  mapForwards: boolean
  mapLeft: boolean
  mapBackwards: boolean
  mapRight: boolean
  mapRotateClockwise: boolean
  mapRotateAnticlockwise: boolean
  mouseZoom: number
}

export function getDefaultControlState() {
  return {
    mapForwards: false,
    mapLeft: false,
    mapBackwards: false,
    mapRight: false,
    mapRotateClockwise: false,
    mapRotateAnticlockwise: false,
    mouseZoom: 0,
  }
}
