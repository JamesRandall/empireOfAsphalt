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
import { MutableProperty } from "../properties/MutableProperty"

export class Window extends GuiElement {
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4
  title: string
  container: Container
  titleBar

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, [])

    this.title = attributeOrDefault(props, "title", "")
    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightChrome))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midChrome))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkChrome))

    const closeButtonImage = new Image(undefined, [])
    closeButtonImage.sizeToFitParent = SizeToFit.WidthAndHeight
    closeButtonImage.name = "xmark"
    const closeButton = new Button(undefined, [])
    closeButton.midChrome = this.midChrome
    closeButton.lightChrome = this.lightChrome
    closeButton.darkChrome = this.darkChrome
    closeButton.left = MutableProperty.with(0)
    closeButton.top = MutableProperty.with(0)
    closeButton.width = MutableProperty.with(constants.window.closeButtonWidth)
    closeButton.height = MutableProperty.with(constants.window.titleBarHeight)
    closeButton.padding = MutableProperty.with(6)
    closeButton.children.push(closeButtonImage)

    const raisedBevel = new RaisedBevel(undefined, [])
    raisedBevel.midChrome = this.midChrome
    raisedBevel.lightChrome = this.lightChrome
    raisedBevel.darkChrome = this.darkChrome
    raisedBevel.left = MutableProperty.with(0)
    raisedBevel.top = MutableProperty.with(0)
    raisedBevel.sizeToFitParent = SizeToFit.WidthAndHeight

    this.titleBar = new WindowTitleBar(undefined, [])
    this.titleBar.left = MutableProperty.with(constants.window.closeButtonWidth)
    this.titleBar.top = MutableProperty.with(0)
    this.titleBar.height = MutableProperty.with(constants.window.titleBarHeight)
    this.titleBar.sizeToFitParent = SizeToFit.Width
    this.titleBar.title = this.title
    this.titleBar.parentWindow = this

    this.container = new Container(undefined, children)
    this.container.top = MutableProperty.with(constants.window.titleBarHeight)
    this.container.sizeToFitParent = SizeToFit.Width

    this.children.push(raisedBevel)
    this.children.push(closeButton)
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
  }

  layout(context: GuiLayoutContext) {
    super.layout(context)
    this.layoutChildren(context)
  }
}
