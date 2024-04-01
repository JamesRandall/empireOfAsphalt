import { GuiElement, GuiRenderContext } from "../GuiElement"
import { constants } from "../constants"
import { Attributes } from "../builder"
import { InteractiveElement, MouseButton, MouseCapture } from "./InteractiveElement"
import { vec4 } from "gl-matrix"
import { attributeOrDefault, vec4FromNumber } from "../utilities"
import { Layout } from "../properties/LayoutDecorator"
import { Frame } from "../Frame"
import { MutableProperty, mutablePropertyFromBoolProp, mutablePropertyFromProp } from "../properties/MutableProperty"

export class Button extends InteractiveElement {
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4
  @Layout()
  isSelected: MutableProperty<boolean>
  private _mouseDown = false

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightChrome))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midChrome))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkChrome))
    let isSelected: MutableProperty<boolean> | undefined
    if (props !== undefined) {
      const isSelectedProp = props["isSelected"]
      if (isSelectedProp !== undefined) {
        isSelected = mutablePropertyFromBoolProp(isSelectedProp)
      }
    }
    this.isSelected = isSelected === undefined ? MutableProperty.with(false) : isSelected
  }

  public handleMouseDown(button: MouseButton, position: { x: number; y: number }, capture: MouseCapture) {
    this._mouseDown = true
    return super.handleMouseDown(button, position, capture)
  }

  public handleMouseUp(
    button: MouseButton,
    position: { x: number; y: number },
    timePressed: number,
    capture: MouseCapture,
  ) {
    this._mouseDown = false
    return super.handleMouseUp(button, position, timePressed, capture)
  }

  private get showPressed() {
    return this._mouseDown || this.isSelected.value
  }

  public renderControl(context: GuiRenderContext) {
    super.renderControl(context)
    const { left, top, width, height } = context.frame
    const cw = constants.chromeStrokeWidth
    context.primitives.rect([left, top], [width, height], this.midChrome)
    const topLeftColor = this.showPressed ? this.darkChrome : this.lightChrome
    const bottomRightColor = this.showPressed ? this.lightChrome : this.darkChrome
    context.primitives.rect([left, top], [width, cw], topLeftColor)
    context.primitives.rect([left, top], [cw, height], topLeftColor)
    context.primitives.rect([left + width - cw, top], [cw, height], bottomRightColor)
    context.primitives.rect([left, top + height - cw], [width, cw], bottomRightColor)
  }

  protected calculateInnerFrame() {
    if (!this.showPressed) return super.calculateInnerFrame()

    const padding = this.padding?.value ?? 0
    return new Frame(
      padding + 2,
      padding + 2,
      this.outerFrame.width - padding * 2,
      this.outerFrame.height - padding * 2,
    )
  }
}
