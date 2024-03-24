import { GuiElement, GuiRenderContext } from "../base"
import { constants } from "../constants"
import { Attributes } from "../builder"
import { InteractiveElement, MouseButton } from "./InteractiveElement"
import { vec4 } from "gl-matrix"
import { attributeOrDefault, vec4FromNumber } from "../utilities"

export class Button extends InteractiveElement {
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightChrome))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midChrome))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkChrome))
  }

  public render(context: GuiRenderContext) {
    const { left, top, width, height } = this.outerFrame
    const cw = constants.chromeStrokeWidth
    context.primitives.rect([left, top], [width, height], this.midChrome)
    context.primitives.rect([left, top], [width, cw], this.lightChrome)
    context.primitives.rect([left, top], [cw, height], this.lightChrome)
    context.primitives.rect([left + width - cw, top], [cw, height], this.darkChrome)
    context.primitives.rect([left, top + height - cw], [width, cw], this.darkChrome)

    super.render(context)
  }
}
