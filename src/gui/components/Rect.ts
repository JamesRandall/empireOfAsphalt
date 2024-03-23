import { GuiElement } from "../base"
import { Primitives } from "../../renderer/primitives/primitives"
import { vec4FromNumber } from "../utilities"
import { Shape } from "./Shape"

export class Rect extends Shape {
  render(gl: WebGL2RenderingContext, primitives: Primitives) {
    super.render(gl, primitives)
    primitives.rect(
      [this.calculatedPosition.left, this.calculatedPosition.top],
      [this.calculatedPosition.width, this.calculatedPosition.height],
      this.fill,
    )
  }
}
