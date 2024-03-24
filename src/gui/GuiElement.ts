import { Primitives } from "../renderer/primitives/primitives"
import { Texture } from "../resources/texture"
import { Attributes } from "./builder"
import { vec2 } from "gl-matrix"
import { attributeOrDefault } from "./utilities"
import { Frame } from "./Frame"
import { MutableProperty } from "./properties/MutableProperty"
import { Layout } from "./properties/LayoutDecorator"

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

  @Layout()
  left?: MutableProperty
  @Layout()
  top?: MutableProperty
  @Layout()
  width?: MutableProperty
  @Layout()
  height?: MutableProperty
  @Layout()
  padding?: MutableProperty
  sizeToFitParent: SizeToFit
  objectId: number | null

  constructor(attributes: Attributes | undefined, children: GuiElement[]) {
    this.children = children
    if (attributes !== undefined) {
      const left = attributes["left"]
      if (left !== undefined) {
        this.left = new MutableProperty(left)
      }
      const top = attributes["top"]
      if (top !== undefined) {
        this.top = new MutableProperty(top)
      }
      const width = attributes["width"]
      if (width !== undefined) {
        this.width = new MutableProperty(width)
      }
      const height = attributes["height"]
      if (height !== undefined) {
        this.height = new MutableProperty(height)
      }
      const padding = attributes["padding"]
      if (height !== undefined) {
        this.padding = new MutableProperty(padding)
      }
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

    const padding = this.padding?.value ?? 0
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
    this.outerFrame = new Frame(
      this.left?.value ?? 0,
      this.top?.value ?? 0,
      (this.sizeToFitParent & SizeToFit.Width) === SizeToFit.Width
        ? context.frame.width - (this.left?.value ?? 0)
        : this.width?.value ?? -1,
      (this.sizeToFitParent & SizeToFit.Height) === SizeToFit.Height
        ? context.frame.height - (this.top?.value ?? 0)
        : this.height?.value ?? -1,
    )

    this.layoutChildren(context)
  }

  protected layoutChildren(context: GuiLayoutContext) {
    const padding = this.padding?.value ?? 0
    const innerFrame = new Frame(0, 0, this.outerFrame.width - padding * 2, this.outerFrame.height - padding * 2)
    this.children.forEach((c) => c.layout({ ...context, frame: innerFrame, parent: this }))
  }
}
