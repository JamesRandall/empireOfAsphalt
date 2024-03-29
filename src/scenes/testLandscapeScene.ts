import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"
import { createGameWithLandscape, Game, ToolSelectionMode } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { glMatrix, mat4, vec3, vec4 } from "gl-matrix"
import { generateHeightMap } from "../proceduralGeneration/generateLandscape"
import { createLandscape } from "../resources/landscape"
import { bindMouse } from "../controls/bindMouse"
import { applyControlState, cycleControlState } from "../gameLoop/applyControlState"
import { createObjectPickerRenderer } from "../renderer/objectPickerRenderer"
import { testGui } from "./testGui"
import { createRuntime } from "../gui/runtime"
import { getPositionFromObjectId } from "../utilities"
import { applyTool } from "../tools/applyTool"
import { applyToolClearsSelection, toolSelectionMode } from "../tools/utilities"

export function createTestLandscapeScene(gl: WebGL2RenderingContext, resources: Resources) {
  let tileRenderer = createTileRenderer(gl, resources)
  let rootRenderer = createRootRenderer(gl, resources, tileRenderer.render)
  let objectPickerRenderer = createObjectPickerRenderer(gl, resources, (projectionMatrix, game) => {
    tileRenderer.renderObjectPicker(projectionMatrix, game)
    gui.renderObjectPicker()
  })
  const heightmap = generateHeightMap(256)
  const landscape = createLandscape(gl, heightmap)
  const game = createGameWithLandscape(landscape)
  let gui = createRuntime(
    gl,
    resources,
    gl.canvas.width,
    gl.canvas.height,
    () => testGui(game),
    (name) => resources.guiTextures[name],
    game.landscape.size * game.landscape.size + 1, // start the gui object IDs after the landscape picker number range
  )

  game.light.position = vec3.fromValues(-0.5, -0.25, -0.5) // this is a direction if we use a directional light
  bindKeys(game.controlState.current)
  bindMouse(game.controlState.current)

  let isFirst = true
  let then = 0
  let deltaTime = 0
  return {
    resize: () => {
      rootRenderer.dispose()
      tileRenderer.dispose()
      objectPickerRenderer.dispose()
      gui.dispose()
      tileRenderer = createTileRenderer(gl, resources)
      rootRenderer = createRootRenderer(gl, resources, tileRenderer.render)
      gui = createRuntime(
        gl,
        resources,
        gl.canvas.width,
        gl.canvas.height,
        () => testGui(game),
        (name) => resources.guiTextures[name],
        game.landscape.size * game.landscape.size + 1, // start the gui object IDs after the landscape picker number range
      )
      objectPickerRenderer = createObjectPickerRenderer(gl, resources, (projectionMatrix, game) => {
        tileRenderer.renderObjectPicker(projectionMatrix, game)
        gui.renderObjectPicker()
      })
    },
    update: (now: number) => {
      if (isFirst) {
        resources.soundEffects.bootUp()
        then = now * 0.001
        isFirst = false
        return
      }

      now *= 0.001 // convert to seconds
      deltaTime = now - then
      then = now

      applyControlState(game, deltaTime)
      const guiHandledInteraction = gui.applyControlState(
        game.controlState.current,
        deltaTime,
        objectPickerRenderer.getObjectId(),
      )
      applyRotation(game, deltaTime)
      rootRenderer.render(game, deltaTime, RenderEffect.None)
      gui.render()

      objectPickerRenderer.render(game, deltaTime)

      if (!guiHandledInteraction) {
        if (game.controlState.current.mouseButtons.left) {
          game.selectedObjectId = objectPickerRenderer.getObjectId()
          const toolMode = toolSelectionMode(game.gui.currentTool)
          if (toolMode !== ToolSelectionMode.None) {
            const p = getPositionFromObjectId(game.selectedObjectId, game.landscape.size)
            if (game.gui.selection === null) {
              game.gui.selection = { start: { ...p }, end: { ...p } }
            } else {
              switch (toolMode) {
                case ToolSelectionMode.Range:
                  game.gui.selection.end = { ...p }
                  break
                case ToolSelectionMode.Single:
                  game.gui.selection = { start: { ...p }, end: { ...p } }
                  break
              }
            }
          }
        }

        if (!game.controlState.current.mouseButtons.left && game.controlState.previous.mouseButtons.left) {
          applyTool(gl, game)
          if (applyToolClearsSelection(game.gui.currentTool)) {
            game.gui.selection = null
          }
        }
      }

      cycleControlState(game)

      return null
    },
  }
}

function rotateCameraAroundY(game: Game, toApply: number) {
  const centerToEye = vec3.create()
  vec3.subtract(centerToEye, game.view.position, game.view.lookAt)
  let rotationMatrix = mat4.create()
  mat4.rotateY(rotationMatrix, rotationMatrix, glMatrix.toRadian(toApply))
  let rotatedCenterToEye = vec3.create()
  vec3.transformMat4(rotatedCenterToEye, centerToEye, rotationMatrix)
  let newEye = vec3.create()
  vec3.add(newEye, game.view.lookAt, rotatedCenterToEye)
  game.view.position = newEye
}

function applyRotation(game: Game, deltaTime: number) {
  const rotationSpeedDegreesPerSecond = 180

  if (game.view.targetRotation !== null) {
    let toApply = rotationSpeedDegreesPerSecond * deltaTime
    if (game.view.targetRotation > game.view.rotation) {
      if (game.view.rotation + toApply >= game.view.targetRotation) {
        toApply = game.view.targetRotation - game.view.rotation
        game.view.targetRotation = null
      }
      game.view.rotation += toApply
      rotateCameraAroundY(game, toApply)
    } else if (game.view.targetRotation < game.view.rotation) {
      let toApply = rotationSpeedDegreesPerSecond * deltaTime
      if (game.view.rotation - toApply <= game.view.targetRotation) {
        toApply = game.view.rotation - game.view.targetRotation
        game.view.targetRotation = null
      }
      game.view.rotation -= toApply
      rotateCameraAroundY(game, -toApply)
    } else {
      game.view.targetRotation = null
    }
  }
}
