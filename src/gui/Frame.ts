import { GuiRect } from "./GuiElement"
import { vec2 } from "gl-matrix"

export class Frame implements GuiRect {
  left: number
  top: number
  width: number
  height: number

  constructor(left: number, top: number, width: number, height: number) {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
  }

  public copy() {
    return new Frame(this.left, this.top, this.width, this.height)
  }

  public get topLeft() {
    return vec2.fromValues(this.left, this.top)
  }

  public get topRight() {
    return vec2.fromValues(this.left + this.width, this.top)
  }

  public get bottomLeft() {
    return vec2.fromValues(this.left, this.top + this.height)
  }

  public get bottomRight() {
    return vec2.fromValues(this.left + this.width, this.top + this.height)
  }
}
