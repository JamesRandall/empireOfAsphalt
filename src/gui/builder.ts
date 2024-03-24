import { Button } from "./components/Button"
import { GuiElement } from "./base"
import { HLayout } from "./components/HLayout"
import { Fragment } from "./components/Fragment"
import { Rect } from "./components/Shapes/Rect"
import { Image } from "./components/Image"
import { Container } from "./components/Container"
import { Window } from "./components/WIndow"
import { RaisedBevel } from "./components/Shapes/RaisedBevel"

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

export type CreateGuiElementFunc<P> = (
  type: GuiElementType,
  props?: (Attributes & P) | null,
  ...children: GuiElement[]
) => GuiElement | null

export function createGuiElement<P = {}>(
  type: GuiElementType,
  props?: (Attributes & P) | null,
  ...children: GuiElement[]
): GuiElement {
  if (type === "button") {
    return new Button(props ?? undefined, children)
  } else if (type === "hlayout") {
    return new HLayout(props ?? undefined, children)
  } else if (type === "rect") {
    return new Rect(props ?? undefined, children)
  } else if (type === "image") {
    return new Image(props ?? undefined, children)
  } else if (type === "container") {
    return new Container(props ?? undefined, children)
  } else if (type === "window") {
    return new Window(props ?? undefined, children)
  } else if (type === "raisedbevel") {
    return new RaisedBevel(props ?? undefined, children)
  } else if (type === "bevel") {
    return new RaisedBevel(props ?? undefined, children)
  }
  return new Fragment(props ?? undefined, children)
}
