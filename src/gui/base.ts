import { Primitives } from "../renderer/primitives/primitives"
import { Texture } from "../resources/texture"
import { Attributes } from "./builder"
import { vec2 } from "gl-matrix"
import { attributeOrDefault } from "./utilities"
import { objectIdToVec4, sizeToFit } from "../utilities"
import { constants } from "./constants"

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
}

export interface GuiLayoutContext {
  gl: WebGL2RenderingContext
  primitives: Primitives
  textureProvider: (name: string) => Texture
  frame: GuiRect
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

  outerFrame: { left: number; top: number; width: number; height: number }
  innerFrame: { left: number; top: number; width: number; height: number }

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
    this.sizeToFitParent = sizeToFit(attributeOrDefault(attributes, "sizeToFitParent", "none"))
    this.outerFrame = { left: -1, top: -1, width: -1, height: -1 }
    this.innerFrame = { ...this.outerFrame }
    this.objectId = null
  }

  public get position() {
    return vec2.fromValues(this.outerFrame.left, this.outerFrame.top)
  }

  public get size() {
    return vec2.fromValues(this.outerFrame.width, this.outerFrame.height)
  }

  public get isInteractive() {
    return false
  }

  public render(context: GuiRenderContext) {
    this.children.forEach((c) => c.render(context))
  }

  public renderObjectPicker(context: GuiRenderContext) {
    this.children.forEach((c) => c.renderObjectPicker(context))
  }

  public layout(context: GuiLayoutContext) {
    const frame = context.frame
    this.outerFrame = {
      left: frame.left + (this.left ?? 0),
      top: frame.top + (this.top ?? 0),
      width: (this.sizeToFitParent & SizeToFit.Width) === SizeToFit.Width ? context.frame.width : this.width ?? -1,
      height: (this.sizeToFitParent & SizeToFit.Height) === SizeToFit.Height ? context.frame.height : this.height ?? -1,
    }
    const padding = this.padding ?? 0
    this.innerFrame = {
      left: this.outerFrame.left + padding,
      top: this.outerFrame.top + padding,
      width: this.outerFrame.width - padding * 2,
      height: this.outerFrame.height - padding * 2,
    }

    this.children.forEach((c) => c.layout({ ...context, frame: this.innerFrame, parent: this }))
  }
}

export abstract class InteractiveElement extends GuiElement {
  public get isInteractive() {
    return true
  }

  public renderObjectPicker(context: GuiRenderContext) {
    if (this.objectId !== null) {
      context.primitives.rect(this.position, this.size, objectIdToVec4(this.objectId))
    }
    super.renderObjectPicker(context)
  }
}
