import { GuiElement, SizeToFit } from "../base"
import { Attributes } from "../builder"

export class Container extends GuiElement {
  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.sizeToFitParent = SizeToFit.WidthAndHeight
  }
}
