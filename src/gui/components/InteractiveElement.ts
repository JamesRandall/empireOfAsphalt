import { objectIdToVec4 } from "../../utilities"
import { GuiElement, GuiRenderContext } from "../GuiElement"
import { Attributes } from "../builder"
import { attributeOrDefault } from "../utilities"

export enum MouseButton {
  Left,
  Right,
}

export abstract class InteractiveElement extends GuiElement {
  onMouseDown: (button: MouseButton, position: { x: number; y: number }) => void
  onMouseUp: (button: MouseButton, position: { x: number; y: number }, timePressed: number) => void
  onClick: (button: MouseButton) => void

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.onMouseDown = attributeOrDefault(props, "onMouseDown", () => {})
    this.onMouseUp = attributeOrDefault(props, "onMouseUp", () => {})
    this.onClick = attributeOrDefault(props, "onClick", () => {})
  }

  public get isInteractive() {
    return true
  }

  public renderObjectPicker(context: GuiRenderContext) {
    if (this.objectId !== null) {
      context.primitives.rect(this.position, this.size, objectIdToVec4(this.objectId))
    }
    super.renderObjectPicker(context)
  }
}
