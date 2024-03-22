import { Primitives } from "../../renderer/primitives/primitives"
import { Attributes, GuiElement } from "../base"
import { constants } from "../constants"

export class Button extends GuiElement {
  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
  }

  public render(gl: WebGL2RenderingContext, primitives: Primitives) {
    super.render(gl, primitives)
    const { left, top, width, height } = this.calculatedPosition
    primitives.rect([left, top], [width, height], constants.midChrome)
    primitives.rect([left, top], [width, 2], constants.lightChrome)
    primitives.rect([left, top], [2, height], constants.lightChrome)
    primitives.rect([left + width - 2, top + 1], [1, height], constants.darkChrome)
    primitives.rect([left + width - 1, top], [1, height], constants.darkChrome)
    primitives.rect([left + 1, top + height - 1], [width - 1, 1], constants.darkChrome)
    primitives.rect([left + 2, top + height - 2], [width - 2, 1], constants.darkChrome)
  }
}
