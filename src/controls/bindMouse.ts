import { vec2 } from "gl-matrix"
import { ControlState } from "./controlState"

export function bindMouse(controlState: ControlState) {
  const wheel = (ev: WheelEvent) => (controlState.mouseZoom = ev.deltaY)
  const mouseMove = (ev: MouseEvent) => (controlState.mousePosition = { x: ev.clientX, y: ev.clientY })
  const mouseButtons = (ev: MouseEvent) => {
    ev.preventDefault()
    controlState.mouseButtons.left = (ev.buttons & 1) > 0
    controlState.mouseButtons.right = (ev.buttons & 2) > 0
  }
  window.addEventListener("wheel", wheel)
  window.addEventListener("mousemove", mouseMove)
  window.addEventListener("mousedown", mouseButtons)
  window.addEventListener("mouseup", mouseButtons)

  return () => {
    window.removeEventListener("wheel", wheel)
  }
}
