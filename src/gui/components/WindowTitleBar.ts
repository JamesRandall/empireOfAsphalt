import { InteractiveElement } from "./InteractiveElement"
import { Attributes } from "../builder"
import { GuiElement, GuiRenderContext, SizeToFit } from "../GuiElement"
import { Bevel } from "./Shapes/Bevel"
import { attributeOrDefault, vec4FromNumber } from "../utilities"
import { constants } from "../constants"
import { Window } from "./WIndow"
import { vec4 } from "gl-matrix"

export class WindowTitleBar extends InteractiveElement {
  title: string
  parentWindow?: Window // we need to think about if we want to actually have the full parent chain expressed
  lightChrome: vec4
  midChrome: vec4
  darkChrome: vec4

  private _isDragActive = false
  private _lastPosition = { x: -1, y: -1 }

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.title = attributeOrDefault(props, "title", "")
    this.lightChrome = vec4FromNumber(attributeOrDefault(props, "lightChrome", constants.lightChrome))
    this.midChrome = vec4FromNumber(attributeOrDefault(props, "midChrome", constants.midChrome))
    this.darkChrome = vec4FromNumber(attributeOrDefault(props, "darkChrome", constants.darkChrome))

    const titleBarBevel = new Bevel(undefined, [])
    titleBarBevel.midChrome = this.midChrome
    titleBarBevel.lightChrome = this.lightChrome
    titleBarBevel.darkChrome = this.darkChrome
    titleBarBevel.sizeToFitParent = SizeToFit.WidthAndHeight
    this.onMouseDown = (ev) => {
      this._isDragActive = true
      this._lastPosition = ev.position
      ev.capture(this)
    }
    this.onMouseMove = (ev) => this.dragWindow(ev.position)
    this.onMouseUp = (ev) => {
      this._isDragActive = false
      ev.endCapture()
    }
    this.children.push(titleBarBevel)
  }

  private dragWindow(position: { x: number; y: number }) {
    if (!this._isDragActive) return

    const xDelta = position.x - this._lastPosition.x
    const yDelta = position.y - this._lastPosition.y
    this._lastPosition = position

    if (this.parentWindow?.left !== undefined) {
      this.parentWindow!.left!.value += xDelta
    }
    if (this.parentWindow?.top !== undefined) {
      this.parentWindow!.top!.value += yDelta
    }
  }

  renderControl(context: GuiRenderContext) {
    super.renderControl(context)
    const p = context.primitives
    const f = context.frame
    const sz = p.text.measure(this.title)
    const left = f.left + f.width / 2 - sz.width / 2
    const top = f.top + f.height / 2 - sz.height / 2

    p.text.draw(this.title, [left + 2, top + 2], [0, 0, 0, 1])
    p.text.draw(this.title, [left, top], [1, 1, 1, 1])
  }
}
