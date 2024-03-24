import { Primitives } from "../renderer/primitives/primitives"
import { Texture } from "../resources/texture"
import { Attributes } from "./builder"
import { vec2 } from "gl-matrix"
import { attributeOrDefault } from "./utilities"
import { Frame } from "./Frame"

export enum HorizontalAlignment {
  Left,
  Middle,
  Right,
}

export enum SizeToFit {
  None,
  Width,
  Height,
  WidthAndHeight,
}

export interface GuiRenderContext {
  gl: WebGL2RenderingContext
  primitives: Primitives
  textureProvider: (name: string) => Texture
  frame: Frame
  parent?: GuiElement
}

export interface GuiLayoutContext {
  gl: WebGL2RenderingContext
  primitives: Primitives
  textureProvider: (name: string) => Texture
  frame: Frame
  parent?: GuiElement
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

  outerFrame: Frame
  innerFrame: Frame

  left?: number
  top?: number
  width?: number
  height?: number
  padding?: number
  sizeToFitParent: SizeToFit
  objectId: number | null

  constructor(attributes: Attributes | undefined, children: GuiElement[]) {
    this.children = children
    if (attributes !== undefined) {
      this.left = attributes["left"]
      this.top = attributes["top"]
      this.width = attributes["width"]
      this.height = attributes["height"]
      this.padding = attributes["padding"]
    }
    this.sizeToFitParent = attributeOrDefault(attributes, "sizeToFitParent", SizeToFit.None) //sizeToFit(attributeOrDefault(attributes, "sizeToFitParent", "none"))
    this.outerFrame = new Frame(-1, -1, -1, -1)
    this.innerFrame = this.outerFrame.copy()
    this.objectId = null
  }

  public get position() {
    return vec2.fromValues(this.outerFrame.left, this.outerFrame.top)
  }

  public get topRight() {
    return vec2.fromValues(this.outerFrame.left + this.outerFrame.width, this.outerFrame.top)
  }

  public get bottomLeft() {
    return vec2.fromValues(this.outerFrame.left, this.outerFrame.top + this.outerFrame.height)
  }

  public get size() {
    return vec2.fromValues(this.outerFrame.width, this.outerFrame.height)
  }

  public get isInteractive() {
    return false
  }

  public render(context: GuiRenderContext) {
    const resolvedFrame = new Frame(
      context.frame.left + this.outerFrame.left,
      context.frame.top + this.outerFrame.top,
      this.outerFrame.width,
      this.outerFrame.height,
    )
    const thisContext = { ...context, frame: resolvedFrame }
    this.renderControl(thisContext)

    const padding = this.padding ?? 0
    const innerFrame = new Frame(
      context.frame.left + this.outerFrame.left + padding,
      context.frame.top + this.outerFrame.top + padding,
      this.outerFrame.width - padding * 2,
      this.outerFrame.height - padding * 2,
    )
    const childFrame = { ...context, frame: innerFrame }
    this.children.forEach((c) => c.render(childFrame))
  }

  public renderControl(context: GuiRenderContext) {}

  public renderObjectPicker(context: GuiRenderContext) {
    this.children.forEach((c) => c.renderObjectPicker(context))
  }

  public layout(context: GuiLayoutContext) {
    const frame = context.frame
    this.outerFrame = new Frame(
      this.left ?? 0,
      this.top ?? 0,
      (this.sizeToFitParent & SizeToFit.Width) === SizeToFit.Width ? context.frame.width : this.width ?? -1,
      (this.sizeToFitParent & SizeToFit.Height) === SizeToFit.Height ? context.frame.height : this.height ?? -1,
    )
    this.layoutChildren(context)
  }

  protected layoutChildren(context: GuiLayoutContext) {
    const padding = this.padding ?? 0
    const innerFrame = new Frame(0, 0, this.outerFrame.width - padding * 2, this.outerFrame.height - padding * 2)
    this.children.forEach((c) => c.layout({ ...context, frame: innerFrame, parent: this }))
  }
}
