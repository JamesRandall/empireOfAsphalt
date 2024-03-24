import { GuiElement, GuiLayoutContext, GuiRenderContext } from "../../base"
import { vec4 } from "gl-matrix"
import { Attributes } from "../../builder"
import { attributeOrDefault, vec4FromNumber } from "../../utilities"
import { constants } from "../../constants"

export class Bevel extends GuiElement {
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightChrome))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midChrome))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkChrome))
  }

  render(context: GuiRenderContext) {
    const p = context.primitives
    const cw = constants.chromeStrokeWidth
    p.rect(this.position, [this.size[0], cw], this.lightChrome)
    p.rect(this.position, [cw, this.size[1]], this.lightChrome)
    p.rect([this.topRight[0] - cw, this.topRight[1]], [cw, this.size[1]], this.darkChrome)
    p.rect([this.bottomLeft[0], this.bottomLeft[1] - cw], [this.size[0], cw], this.darkChrome)

    p.rect([this.position[0] + cw, this.position[1] + cw], [cw, this.size[1] - cw * 2], this.darkChrome)
    p.rect([this.position[0] + cw, this.position[1] + cw], [this.size[0] - cw, cw], this.darkChrome)

    p.rect(
      [this.position[0] + cw * 2, this.position[1] + this.size[1] - cw * 2],
      [this.size[0] - cw * 3, cw],
      this.lightChrome,
    )
    p.rect(
      [this.position[0] + this.size[0] - cw * 2, this.position[1] + cw * 2],
      [cw, this.size[1] - cw * 3],
      this.lightChrome,
    )

    super.render(context)
  }

  layout(context: GuiLayoutContext) {
    super.layout(context)
  }
}
