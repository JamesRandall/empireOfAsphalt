import { GuiElement, GuiLayoutContext, GuiRect, GuiRenderContext } from "../base"
import { Attributes } from "../builder"
import { attributeOrDefault } from "../utilities"

export class Image extends GuiElement {
  name: string

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.name = attributeOrDefault(props, "name", "").trim()
  }

  layout(context: GuiLayoutContext) {
    super.layout(context)
    const texture = context.textureProvider(this.name)
    if (texture === undefined) return
    if (!this.sizeToFitParent) {
      this.outerFrame.width = texture.width
      this.outerFrame.height = texture.height
    }
  }

  render(context: GuiRenderContext) {
    super.render(context)
    if (this.name.length === 0) return
    const texture = context.textureProvider(this.name)
    if (texture === undefined) return

    context.primitives.texturedRect(this.position, this.size, texture)
  }
}
