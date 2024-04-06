import { GuiElement, GuiRenderContext } from "../../GuiElement"
import { Primitives } from "../../../renderer/primitives/primitives"
import { vec4FromNumber } from "../../utilities"
import { Shape } from "./Shape"

export class Rect extends Shape {
  renderControl(context: GuiRenderContext) {
    super.renderControl(context)
    context.primitives.rect(context.frame.topLeft, context.frame.size, this.fill)
  }
}
