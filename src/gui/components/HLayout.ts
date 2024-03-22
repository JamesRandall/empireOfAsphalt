import { Primitives } from "../../renderer/primitives/primitives"
import { Attributes, GuiElement, GuiRect } from "../base"
import { constants } from "../constants"

export class HLayout extends GuiElement {
  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
  }

  public layout(frame: GuiRect) {
    super.layout(frame)
    this.children.reduce((x, child) => {
      child.left = x
      return x + child.calculatedPosition.width
    }, this.calculatedPosition.left)
  }
}
