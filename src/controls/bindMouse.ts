import { vec2 } from "gl-matrix"
import { ControlState } from "./controlState"

export function bindMouse(controlState: ControlState) {
  const wheel = (ev: WheelEvent) => (controlState.mouseZoom = ev.deltaY)
  window.addEventListener("wheel", wheel)

  return () => {
    window.removeEventListener("wheel", wheel)
  }
}
