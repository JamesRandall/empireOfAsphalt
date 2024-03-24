import { GuiElement, GuiLayoutContext, GuiRenderContext, SizeToFit } from "../GuiElement"
import { vec4 } from "gl-matrix"
import { Attributes } from "../builder"
import { attributeOrDefault, vec4FromNumber } from "../utilities"
import { Button } from "./Button"
import { RaisedBevel } from "./Shapes/RaisedBevel"
import { Image } from "./Image"
import { constants } from "../constants"
import { Container } from "./Container"
import { WindowTitleBar } from "./WindowTitleBar"

export class Window extends GuiElement {
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4
  //titleBarBevel: Bevel
  title: string
  container: Container
  titleBar

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, [])

    this.title = attributeOrDefault(props, "title", "")

    const closeButtonImage = new Image(undefined, [])
    closeButtonImage.sizeToFitParent = SizeToFit.WidthAndHeight
    closeButtonImage.name = "xmark"
    const closeButton = new Button(undefined, [])
    closeButton.midChrome = vec4FromNumber(constants.midGreen)
    closeButton.lightChrome = vec4FromNumber(constants.lightGreen)
    closeButton.darkChrome = vec4FromNumber(constants.darkGreen)
    closeButton.left = 0
    closeButton.top = 0
    closeButton.width = constants.window.closeButtonWidth
    closeButton.height = constants.window.titleBarHeight
    closeButton.padding = 6
    closeButton.children.push(closeButtonImage)

    const raisedBevel = new RaisedBevel(undefined, [])
    raisedBevel.midChrome = vec4FromNumber(constants.midGreen)
    raisedBevel.lightChrome = vec4FromNumber(constants.lightGreen)
    raisedBevel.darkChrome = vec4FromNumber(constants.darkGreen)
    raisedBevel.left = 0
    raisedBevel.top = 0
    raisedBevel.sizeToFitParent = SizeToFit.WidthAndHeight

    this.titleBar = new WindowTitleBar(undefined, [])
    this.titleBar.left = constants.window.closeButtonWidth
    this.titleBar.top = 0
    this.titleBar.height = constants.window.titleBarHeight
    this.titleBar.sizeToFitParent = SizeToFit.Width

    /*this.titleBarBevel = new Bevel(undefined, [])
    this.titleBarBevel.midChrome = vec4FromNumber(constants.midGreen)
    this.titleBarBevel.lightChrome = vec4FromNumber(constants.lightGreen)
    this.titleBarBevel.darkChrome = vec4FromNumber(constants.darkGreen)
    this.titleBarBevel.left = constants.window.closeButtonWidth
    this.titleBarBevel.top = 0
    this.titleBarBevel.height = constants.window.titleBarHeight*/

    this.container = new Container(undefined, children)
    this.container.sizeToFitParent = SizeToFit.None

    this.children.push(raisedBevel)
    this.children.push(closeButton)
    //this.children.push(this.titleBarBevel)
    this.children.push(this.titleBar)
    this.children.push(this.container)

    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightGreen))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midGreen))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkGreen))
  }

  renderControl(context: GuiRenderContext) {
    super.renderControl(context)
    const p = context.primitives
    p.rect(this.position, this.size, this.midChrome)
    p.text.draw(
      this.title,
      [this.outerFrame.left + constants.window.closeButtonWidth + 10, this.outerFrame.top + 10],
      [0, 0, 0, 1],
    )
    p.text.draw(
      this.title,
      [this.outerFrame.left + constants.window.closeButtonWidth + 8, this.outerFrame.top + 8],
      [1, 1, 1, 1],
    )
  }

  layout(context: GuiLayoutContext) {
    super.layout(context)
    this.titleBar.width = this.size[0] - constants.window.closeButtonWidth
    //this.titleBarBevel.layout({ ...context, frame: this.innerFrame })
    this.container.left = this.padding ?? constants.chromeStrokeWidth
    this.container.width = this.outerFrame.width - (this.padding ?? constants.chromeStrokeWidth) * 2
    this.container.top = constants.window.titleBarHeight
    this.container.height = this.outerFrame.height - constants.window.titleBarHeight - constants.chromeStrokeWidth
    this.layoutChildren(context)
  }
}
