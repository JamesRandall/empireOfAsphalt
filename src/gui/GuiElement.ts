import { Primitives } from "../renderer/primitives/primitives"
import { Texture } from "../resources/texture"
import { Attributes } from "./builder"
import { vec2 } from "gl-matrix"
import { attributeOrDefault } from "./utilities"
import { Frame } from "./Frame"
import { MutableProperty, mutablePropertyFromBoolProp, mutablePropertyFromProp } from "./properties/MutableProperty"
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
  left?: MutableProperty<number>
  @Layout()
  top?: MutableProperty<number>
  @Layout()
  width?: MutableProperty<number>
  @Layout()
  height?: MutableProperty<number>
  @Layout()
  padding?: MutableProperty<number>
  @Layout()
  isVisible: MutableProperty<boolean>
  sizeToFitParent: SizeToFit
  objectId: number | null

  private _layoutRequired = true

  constructor(attributes: Attributes | undefined, children: GuiElement[]) {
    this.children = children
    let isVisible: MutableProperty<boolean> | undefined = undefined
    if (attributes !== undefined) {
      const left = attributes["left"]
      if (left !== undefined) {
        this.left = mutablePropertyFromProp(left)
      }
      const top = attributes["top"]
      if (top !== undefined) {
        this.top = mutablePropertyFromProp(top)
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
      if (padding !== undefined) {
        this.padding = new MutableProperty(padding)
      }
      const isVisibleAttr = attributes["isVisible"]
      if (isVisibleAttr !== undefined) {
        isVisible = mutablePropertyFromBoolProp(isVisibleAttr)
      }
    }
    this.isVisible = isVisible ?? MutableProperty.with(true)
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

  private renderFlow(
    context: GuiRenderContext,
    control: (context: GuiRenderContext) => void,
    children: (child: GuiElement, context: GuiRenderContext) => void,
  ) {
    const resolvedFrame = new Frame(
      context.frame.left + this.outerFrame.left,
      context.frame.top + this.outerFrame.top,
      this.outerFrame.width,
      this.outerFrame.height,
    )
    const thisContext = { ...context, frame: resolvedFrame }
    control(thisContext)

    const padding = this.padding?.value ?? 0
    const innerFrame = new Frame(
      context.frame.left + this.outerFrame.left,
      context.frame.top + this.outerFrame.top,
      this.outerFrame.width,
      this.outerFrame.height,
    )
    const childFrame = { ...context, frame: innerFrame }
    this.children.forEach((c) => children(c, childFrame))
  }

  public render(context: GuiRenderContext) {
    if (!this.isVisible.value) return
    this.renderFlow(
      context,
      (ctx) => this.renderControl(ctx),
      (ctrl, ctx) => ctrl.render(ctx),
    )
  }

  public renderControl(context: GuiRenderContext) {}

  public renderObjectPicker(context: GuiRenderContext) {
    if (!this.isVisible.value) return
    this.renderFlow(
      context,
      (ctx) => this.renderObjectPickerControl(ctx),
      (ctrl, ctx) => ctrl.renderObjectPicker(ctx),
    )
  }

  public renderObjectPickerControl(context: GuiRenderContext) {}

  public layout(context: GuiLayoutContext) {
    //if (!this._layoutRequired) return
    this.outerFrame = new Frame(
      (this.left?.value ?? 0) + context.frame.left,
      (this.top?.value ?? 0) + context.frame.top,
      (this.sizeToFitParent & SizeToFit.Width) === SizeToFit.Width
        ? context.frame.width - (this.left?.value ?? 0)
        : this.width?.value ?? -1,
      (this.sizeToFitParent & SizeToFit.Height) === SizeToFit.Height
        ? context.frame.height - (this.top?.value ?? 0)
        : this.height?.value ?? -1,
    )

    this.layoutChildren(context)
  }

  protected calculateInnerFrame() {
    const padding = this.padding?.value ?? 0
    return new Frame(padding, padding, this.outerFrame.width - padding * 2, this.outerFrame.height - padding * 2)
  }

  protected layoutChildren(context: GuiLayoutContext) {
    const innerFrame = this.calculateInnerFrame()
    this.children.forEach((c) => c.layout({ ...context, frame: innerFrame, parent: this }))
  }
}
