import { objectIdToVec4 } from "../../utilities"
import { GuiElement, GuiRenderContext } from "../GuiElement"
import { Attributes } from "../builder"
import { attributeOrDefault } from "../utilities"

export enum MouseButton {
  Left,
  Right,
}

export interface MouseCapture {
  capture: (element: InteractiveElement) => void
  endCapture: () => void
}

export interface MousePositionEvent {
  position: { x: number; y: number }
}

export interface MouseDownEvent extends MousePositionEvent {
  button: MouseButton
}

export interface MouseUpEvent extends MouseDownEvent {
  timePressed: number
}

export abstract class InteractiveElement extends GuiElement {
  onMouseDown: (ev: MouseDownEvent & MouseCapture) => void
  onMouseUp: (ev: MouseUpEvent & MouseCapture) => void
  onMouseMove: (ev: MousePositionEvent & MouseCapture) => void
  onClick: (button: MouseButton) => void

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.onMouseDown = attributeOrDefault(props, "onMouseDown", () => {})
    this.onMouseUp = attributeOrDefault(props, "onMouseUp", () => {})
    this.onMouseMove = attributeOrDefault(props, "onMouseMove", () => {})
    this.onClick = attributeOrDefault(props, "onClick", () => {})
  }

  public get isInteractive() {
    return true
  }

  public renderObjectPickerControl(context: GuiRenderContext) {
    if (this.objectId !== null) {
      context.primitives.rect(context.frame.topLeft, context.frame.size, objectIdToVec4(this.objectId))
    }
    super.renderObjectPickerControl(context)
  }

  public handleMouseDown(button: MouseButton, position: { x: number; y: number }, capture: MouseCapture) {
    const ev = {
      button,
      position,
      ...capture,
    }
    this.onMouseDown(ev)
  }

  public handleMouseUp(
    button: MouseButton,
    position: { x: number; y: number },
    timePressed: number,
    capture: MouseCapture,
  ) {
    const ev = {
      button,
      position,
      timePressed,
      ...capture,
    }
    this.onMouseUp(ev)
  }

  public handleMouseMove(position: { x: number; y: number }, capture: MouseCapture) {
    const ev = {
      position,
      ...capture,
    }
    this.onMouseMove(ev)
  }

  public handleClick(button: MouseButton) {
    this.onClick(button)
  }
}
