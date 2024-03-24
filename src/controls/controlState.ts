import { GuiInput } from "../gui/GuiElement"

export interface ControlState extends GuiInput {
  mapForwards: boolean
  mapLeft: boolean
  mapBackwards: boolean
  mapRight: boolean
  mapRotateClockwise: boolean
  mapRotateAnticlockwise: boolean
  mouseZoom: number
  mousePosition: { x: number; y: number }
  mouseButtons: { left: boolean; right: boolean }
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
    mousePosition: { x: 0, y: 0 },
    mouseButtons: { left: false, right: false },
  }
}
