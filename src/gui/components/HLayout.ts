import { GuiElement, GuiLayoutContext, HorizontalAlignment } from "../GuiElement"
import { Attributes } from "../builder"
import { attributeOrDefault } from "../utilities"
import { MutableProperty } from "../properties/MutableProperty"

export class HLayout extends GuiElement {
  horizontalAlignment: HorizontalAlignment

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.horizontalAlignment = attributeOrDefault(props, "horizontalAlignment", HorizontalAlignment.Left)
  }

  public layout(context: GuiLayoutContext) {
    super.layout(context)

    const contentWidth = this.children.reduce((w, child) => w + child.outerFrame.width, 0)
    const left =
      (this.horizontalAlignment === HorizontalAlignment.Left
        ? 0
        : this.horizontalAlignment === HorizontalAlignment.Right
          ? context.frame.width - contentWidth
          : (context.frame.width - contentWidth) / 2) + context.frame.left
    this.children.reduce((x, child) => {
      if (child.left !== undefined) {
        child.left.value = x
      } else {
        child.left = new MutableProperty(x)
      }

      return x + child.outerFrame.width
    }, left)
    this.layoutChildren({ ...context, frame: this.innerFrame, parent: this })
  }
}
