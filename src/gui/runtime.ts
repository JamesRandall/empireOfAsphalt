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
  let mouseCapturedObject: InteractiveElement | null = null
  const capture = (element: InteractiveElement) => (mouseCapturedObject = element)
  const endCapture = () => (mouseCapturedObject = null)

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
    // we always want the GUI to be more pickable than whats underneath so we disable the depth test
    gl.disable(gl.DEPTH_TEST)
    root.renderObjectPicker({
      gl,
      primitives,
      textureProvider: getTexture,
      frame: new Frame(0, 0, width, height),
    })
  }

  const applyControlState = (controlState: GuiInput, timeDelta: number, selectedObjectId: number) => {
    if (selectedObjectId < startingObjectId || selectedObjectId > lastObjectId) return
    const selectedElement = mouseCapturedObject ?? objectIdMap.get(selectedObjectId)
    if (selectedElement === undefined) return
    if (controlState.mouseButtons.left) {
      if (interactions.leftMouseDown === null) {
        interactions.leftMouseDown = { timer: 0, initialObjectId: selectedObjectId }
        selectedElement.handleMouseDown(MouseButton.Left, controlState.mousePosition, { capture, endCapture })
      }
    } else {
      if (interactions.leftMouseDown !== null) {
        selectedElement.handleMouseUp(MouseButton.Left, controlState.mousePosition, interactions.leftMouseDown.timer, {
          capture,
          endCapture,
        })
        if (selectedObjectId === interactions.leftMouseDown.initialObjectId) {
          selectedElement.handleClick(MouseButton.Left)
        }
        interactions.leftMouseDown = null
      }
    }
    // TODO: we only want to route this if in bounds
    selectedElement.handleMouseMove(controlState.mousePosition, { capture, endCapture })
  }

  const update = (timeDelta: number) => {
    if (interactions.leftMouseDown !== null) {
      interactions.leftMouseDown.timer += timeDelta
    }
  }

  return { render, renderObjectPicker, dispose, update, applyControlState }
}
