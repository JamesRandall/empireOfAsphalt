import { InteractiveElement } from "./InteractiveElement"
import { Attributes } from "../builder"
import { GuiElement, GuiRenderContext, SizeToFit } from "../GuiElement"
import { Bevel } from "./Shapes/Bevel"
import { attributeOrDefault, vec4FromNumber } from "../utilities"
import { constants } from "../constants"
import { Window } from "./WIndow"

export class WindowTitleBar extends InteractiveElement {
  title: string
  parentWindow?: Window // we need to think about if we want to actually have the full parent chain expressed

  private _isDragActive = false
  private _lastPosition = { x: -1, y: -1 }

  constructor(props: Attributes | undefined, children: GuiElement[]) {
    super(props, children)
    this.title = attributeOrDefault(props, "title", "")
    const titleBarBevel = new Bevel(undefined, [])
    titleBarBevel.midChrome = vec4FromNumber(constants.midGreen)
    titleBarBevel.lightChrome = vec4FromNumber(constants.lightGreen)
    titleBarBevel.darkChrome = vec4FromNumber(constants.darkGreen)
    titleBarBevel.sizeToFitParent = SizeToFit.WidthAndHeight
    this.onMouseDown = (_, position: { x: number; y: number }) => {
      this._isDragActive = true
      this._lastPosition = position
    }
    this.onMouseMove = this.dragWindow
    this.onMouseUp = () => {
      this._isDragActive = false
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
