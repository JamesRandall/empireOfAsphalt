import { Primitives } from "../../renderer/primitives/primitives"
import { GuiElement, GuiRenderContext } from "../base"
import { constants } from "../constants"
import { Attributes } from "../builder"

export class Button extends GuiElement {
  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
  }

  public render(context: GuiRenderContext) {
    const { left, top, width, height } = this.outerFrame
    context.primitives.rect([left, top], [width, height], constants.midChrome)
    context.primitives.rect([left, top], [width, 2], constants.lightChrome)
    context.primitives.rect([left, top], [2, height], constants.lightChrome)
    context.primitives.rect([left + width - 2, top + 1], [1, height], constants.darkChrome)
    context.primitives.rect([left + width - 1, top], [1, height], constants.darkChrome)
    context.primitives.rect([left + 1, top + height - 1], [width - 1, 1], constants.darkChrome)
    context.primitives.rect([left + 2, top + height - 2], [width - 2, 1], constants.darkChrome)

    super.render(context)
  }
}
