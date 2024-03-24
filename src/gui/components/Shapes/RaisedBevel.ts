import { GuiElement, GuiRenderContext } from "../../GuiElement"
import { vec4 } from "gl-matrix"
import { Attributes } from "../../builder"
import { attributeOrDefault, vec4FromNumber } from "../../utilities"
import { constants } from "../../constants"

export class RaisedBevel extends GuiElement {
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
    p.rect(context.frame.topLeft, [this.size[0], 2], this.lightChrome)
    p.rect(context.frame.topLeft, [2, this.size[1]], this.lightChrome)
    p.rect([context.frame.topRight[0] - 2, context.frame.topRight[1]], [2, this.size[1]], this.darkChrome)
    p.rect([context.frame.bottomLeft[0], context.frame.bottomLeft[1] - 2], [this.size[0], 2], this.darkChrome)
  }
}
