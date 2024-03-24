import { InteractiveElement } from "./InteractiveElement"
import { Attributes } from "../builder"
import { GuiElement, SizeToFit } from "../GuiElement"
import { Bevel } from "./Shapes/Bevel"
import { vec4FromNumber } from "../utilities"
import { constants } from "../constants"

export class WindowTitleBar extends InteractiveElement {
  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    const titleBarBevel = new Bevel(undefined, [])
    titleBarBevel.midChrome = vec4FromNumber(constants.midGreen)
    titleBarBevel.lightChrome = vec4FromNumber(constants.lightGreen)
    titleBarBevel.darkChrome = vec4FromNumber(constants.darkGreen)
    titleBarBevel.sizeToFitParent = SizeToFit.WidthAndHeight
    //titleBarBevel.left = constants.window.closeButtonWidth
    //titleBarBevel.top = 0
    //titleBarBevel.height = constants.window.titleBarHeight

    this.children.push(titleBarBevel)
  }
}
