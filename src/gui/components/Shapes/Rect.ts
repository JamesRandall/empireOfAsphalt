import { GuiElement, GuiRenderContext } from "../../base"
import { Primitives } from "../../../renderer/primitives/primitives"
import { vec4FromNumber } from "../../utilities"
import { Shape } from "./Shape"

export class Rect extends Shape {
  render(context: GuiRenderContext) {
    super.render(context)
    context.primitives.rect(
      [this.outerFrame.left, this.outerFrame.top],
      [this.outerFrame.width, this.outerFrame.height],
      this.fill,
    )
  }
}
