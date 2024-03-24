import { createPrimitiveRenderer } from "../renderer/primitives/primitives"
import { Resources } from "../resources/resources"
import { GuiElement, GuiInput } from "./GuiElement"
import { Texture } from "../resources/texture"
import { InteractiveElement, MouseButton } from "./components/InteractiveElement"
import { Frame } from "./Frame"

interface Interactions {
  leftMouseDown: { timer: number; initialObjectId: number } | null
}

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
      objectIdMap.set(nextObjectId, element as InteractiveElement)
      nextObjectId++
    }
    element.children.forEach((child) => recursivelySetObjectIds(child))
  }
  recursivelySetObjectIds(root)
  const lastObjectId = nextObjectId - 1

  let interactions: Interactions = {
    leftMouseDown: null,
  }

  const dispose = () => {}
  const render = () => {
    root.layout({
      gl,
      primitives,
      textureProvider: getTexture,
      frame: new Frame(0, 0, width, height),
    })
    root.render({
      gl,
      primitives,
      textureProvider: getTexture,
      frame: new Frame(0, 0, width, height),
    })
  }

  const renderObjectPicker = () => {
    root.renderObjectPicker({
      gl,
      primitives,
      textureProvider: getTexture,
      frame: new Frame(0, 0, width, height),
    })
  }

  const applyControlState = (controlState: GuiInput, timeDelta: number, selectedObjectId: number) => {
    if (selectedObjectId < startingObjectId || selectedObjectId > lastObjectId) return
    const selectedElement = objectIdMap.get(selectedObjectId)
    if (selectedElement === undefined) return
    if (controlState.mouseButtons.left) {
      if (interactions.leftMouseDown === null) {
        interactions.leftMouseDown = { timer: 0, initialObjectId: selectedObjectId }
        selectedElement.onMouseDown(MouseButton.Left, controlState.mousePosition)
      }
    } else {
      if (interactions.leftMouseDown !== null) {
        selectedElement.onMouseUp(MouseButton.Left, controlState.mousePosition, interactions.leftMouseDown.timer)
        if (selectedObjectId === interactions.leftMouseDown.initialObjectId) {
          selectedElement.onClick(MouseButton.Left)
        }
        interactions.leftMouseDown = null
      }
    }
    // TODO: we only want to route this if in bounds
    selectedElement.onMouseMove(controlState.mousePosition)
  }

  const update = (timeDelta: number) => {
    if (interactions.leftMouseDown !== null) {
      interactions.leftMouseDown.timer += timeDelta
    }
  }

  return { render, renderObjectPicker, dispose, update, applyControlState }
}
