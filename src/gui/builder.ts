import { Button } from "./components/Button"
import { Primitives } from "../renderer/primitives/primitives"
import { Attributes, GuiElement, GuiElementType } from "./base"
import { HLayout } from "./components/HLayout"

export const jsx = (tag: any, props: any) => {
  return null
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
): GuiElement | null {
  if (type === "button") {
    return new Button(props ?? undefined, children)
  } else if (type === "hlayout") {
    return new HLayout(props ?? undefined, children)
  }
  return null
}
