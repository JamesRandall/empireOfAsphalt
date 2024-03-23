import { Primitives } from "../renderer/primitives/primitives"

export type GuiElementType = "button"

export type PropsKey =
  | "text"
  | "onMouseDown"
  | "onMouseUp"
  | "onClick"
  | "left"
  | "top"
  | "width"
  | "height"
  | "fill"
  | "name"
  | "stroke"

export interface Attributes {
  [key: string]: any
}

export interface GuiRect {
  left: number
  top: number
  width: number
  height: number
}

export interface GuiInput {
  mousePosition: { x: number; y: number }
  mouseButtons: { left: boolean; right: boolean }
}

export abstract class GuiElement {
  children: GuiElement[]

  calculatedPosition: { left: number; top: number; width: number; height: number }

  left?: number
  top?: number
  width?: number
  height?: number

  constructor(attributes: Attributes | undefined, children: GuiElement[]) {
    this.children = children
    if (attributes !== undefined) {
      this.left = attributes["left"]
      this.top = attributes["top"]
      this.width = attributes["width"]
      this.height = attributes["height"]
    }
    this.calculatedPosition = { left: -1, top: -1, width: -1, height: -1 }
  }

  public render(gl: WebGL2RenderingContext, primitives: Primitives) {
    this.children.forEach((c) => c.render(gl, primitives))
  }

  public layout(frame: GuiRect) {
    this.children.forEach((c) => c.layout(frame))

    this.calculatedPosition = {
      left: this.left ?? -1,
      top: this.top ?? -1,
      width: this.width ?? -1,
      height: this.height ?? -1,
    }
  }
}
