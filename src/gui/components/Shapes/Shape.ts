import { GuiElement } from "../../base"
import { attributeOrDefault, vec4FromNumber } from "../../utilities"
import { vec4 } from "gl-matrix"
import { Attributes } from "../../builder"

export abstract class Shape extends GuiElement {
  protected fill: vec4

  constructor(attributes: Attributes | undefined, children: GuiElement[]) {
    super(attributes, children)
    this.fill = vec4FromNumber(attributeOrDefault(attributes, "fill", 0))
  }
}
