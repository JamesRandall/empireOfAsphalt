import { CreateGuiElementFunc } from "./builder"
import { createPrimitiveRenderer } from "../renderer/primitives/primitives"
import { Resources } from "../resources/resources"
import { GuiElement, GuiInput, InteractiveElement } from "./base"
import { Texture } from "../resources/texture"

export function createRuntime(
  gl: WebGL2RenderingContext,
  resources: Resources,
  width: number,
  height: number,
  createRoot: () => GuiElement,
  getTexture: (name: string) => Texture,
  startingObjectId: number,
) {
  const primitives = createPrimitiveRenderer(gl, false, resources, width, height)
  const root = createRoot()
  let nextObjectId = startingObjectId
  let objectIdMap = new Map<number, InteractiveElement>()
  const recursivelySetObjectIds = (element: GuiElement) => {
    if (element.isInteractive) {
      element.objectId = nextObjectId
      objectIdMap.set(nextObjectId, element)
      nextObjectId++
    }
    element.children.forEach((child) => recursivelySetObjectIds(child))
  }
  recursivelySetObjectIds(root)
  const lastObjectId = nextObjectId - 1

  const dispose = () => {}
  const render = () => {
    root.layout({
      gl,
      primitives,
      textureProvider: getTexture,
      frame: { left: 0, top: 0, width: width, height: height },
    })
    root.render({ gl, primitives, textureProvider: getTexture })
  }

  const renderObjectPicker = () => {
    root.renderObjectPicker({ gl, primitives, textureProvider: getTexture })
  }

  const applyControlState = (controlState: GuiInput, timeDelta: number, selectedObjectId: number) => {
    if (selectedObjectId < startingObjectId || selectedObjectId > lastObjectId) return
    console.log(selectedObjectId)
  }

  const update = (timeDelta: number) => {}

  return { render, renderObjectPicker, dispose, update, applyControlState }
}
