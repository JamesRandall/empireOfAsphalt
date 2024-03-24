import { GuiElement, GuiLayoutContext, GuiRenderContext } from "../../GuiElement"
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

  renderControl(context: GuiRenderContext) {
    super.renderControl(context)
    const p = context.primitives
    const cw = constants.chromeStrokeWidth
    const f = context.frame
    p.rect(f.topLeft, [this.size[0], cw], this.lightChrome)
    p.rect(f.topLeft, [cw, this.size[1]], this.lightChrome)
    p.rect([f.topRight[0] - cw, f.topRight[1]], [cw, this.size[1]], this.darkChrome)
    p.rect([f.bottomLeft[0], f.bottomLeft[1] - cw], [this.size[0], cw], this.darkChrome)

    p.rect([f.topLeft[0] + cw, f.topLeft[1] + cw], [cw, this.size[1] - cw * 2], this.darkChrome)
    p.rect([f.topLeft[0] + cw, f.topLeft[1] + cw], [this.size[0] - cw, cw], this.darkChrome)

    p.rect([f.topLeft[0] + cw * 2, f.topLeft[1] + this.size[1] - cw * 2], [this.size[0] - cw * 3, cw], this.lightChrome)
    p.rect([f.topLeft[0] + this.size[0] - cw * 2, f.topLeft[1] + cw * 2], [cw, this.size[1] - cw * 3], this.lightChrome)
  }

  layout(context: GuiLayoutContext) {
    super.layout(context)
  }
}
