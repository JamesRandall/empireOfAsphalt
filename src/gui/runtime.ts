import { CreateGuiElementFunc } from "./builder"
import { createPrimitiveRenderer } from "../renderer/primitives/primitives"
import { Resources } from "../resources/resources"
import { GuiElement } from "./base"

export function createRuntime(
  gl: WebGL2RenderingContext,
  resources: Resources,
  width: number,
  height: number,
  createRoot: () => GuiElement,
) {
  const primitives = createPrimitiveRenderer(gl, false, resources, width, height)
  const root = createRoot()
  const dispose = () => {}
  const render = () => {
    root.layout({ left: 0, top: 0, width: width, height: height })
    root.render(gl, primitives)
  }
  const update = (timeDelta: number) => {}

  return { render, dispose, update }
}
