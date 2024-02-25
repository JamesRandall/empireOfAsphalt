import { ControlState } from "./controlState"

export function bindKeys(controlState: ControlState) {
  const setControl = (e: KeyboardEvent, newState: boolean) => {
    let handled = true
    switch (e.key) {
      case "w":
      case "W":
        controlState.mapForwards = newState
        break
      case "s":
      case "S":
        controlState.mapBackwards = newState
        break
      case "a":
      case "A":
        controlState.mapLeft = newState
        break
      case "d":
      case "D":
        controlState.mapRight = newState
        break
      case "e":
      case "E":
        controlState.mapRotateClockwise = newState
        break
      case "q":
      case "Q":
        controlState.mapRotateAnticlockwise = newState
        break
      default:
        handled = false
    }
    if (handled) {
      e.preventDefault()
    }
  }

  const keyDown = (e: KeyboardEvent) => setControl(e, true)
  const keyUp = (e: KeyboardEvent) => setControl(e, false)

  window.addEventListener("keydown", keyDown)
  window.addEventListener("keyup", keyUp)

  return () => {
    window.removeEventListener("keydown", keyDown)
    window.removeEventListener("keyup", keyUp)
  }
}
