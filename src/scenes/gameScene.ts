import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createLandscapeRenderer } from "../renderer/landscapeRenderer"
import { createGameWithLandscape, Game, Tool, ToolSelectionMode } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { glMatrix, mat4, vec3 } from "gl-matrix"
import { createLandscape } from "../resources/landscape"
import { bindMouse } from "../controls/bindMouse"
import { cycleControlState } from "../gameLoop/applyControlState"
import { createObjectPickerRenderer } from "../renderer/objectPickerRenderer"
import { testGui } from "./testGui"
import { createRuntime } from "../gui/runtime"
import { getPositionFromObjectId } from "../utilities"
import { applyTool } from "../tools/applyTool"
import { applyToolClearsSelection, toolIsAxisLocked, toolSelectionMode } from "../tools/utilities"
import { createBuildingRenderer } from "../renderer/buildingRenderer"
import { gameLoop } from "../gameLoop/gameLoop"
import { blueprintFromTool, createBuildingFromTool } from "../model/building"
import { createWaterRenderer } from "../renderer/waterRenderer"
import { generateSimulationLandscape } from "../proceduralGeneration/generateLandscape"

export function createGameScene(gl: WebGL2RenderingContext, resources: Resources) {
  let tileRenderer = createLandscapeRenderer(gl, resources)
  let buildingRenderer = createBuildingRenderer(gl, resources)
  let waterRenderer = createWaterRenderer(gl, resources)

  let objectPickerRenderer = createObjectPickerRenderer(gl, resources, (projectionMatrix, game) => {
    tileRenderer.renderObjectPicker(projectionMatrix, game)
    gui.renderObjectPicker()
  })
  let rootRenderer = createRootRenderer(gl, resources, (projectionMatrix, game, timeDelta) => {
    tileRenderer.render(projectionMatrix, game)
    waterRenderer.render(projectionMatrix, game, timeDelta)
    buildingRenderer.render(projectionMatrix, game)
  })

  const simulationLandscape = generateSimulationLandscape(256)
  const rendererLandscape = createLandscape(gl, simulationLandscape)
  const game = createGameWithLandscape(simulationLandscape, rendererLandscape)

  for (let bi = 0; bi < 1; bi++) {
    //game.buildings.push(buildingFromTool(resources, Tool.CoalPowerPlant, { x: 128, z: 128 })!)
  }

  let gui = createRuntime(
    gl,
    resources,
    gl.canvas.width,
    gl.canvas.height,
    () => testGui(game),
    (name) => resources.guiTextures[name],
    game.simulation.landscape.size * game.simulation.landscape.size + 1, // start the gui object IDs after the landscape picker number range
  )

  // we use different light directions to get the effect we want
  game.light.direction = vec3.fromValues(-1.0, -0.5, -0.5) // this is a direction if we use a directional light
  game.buildingLight.direction = vec3.fromValues(-1.0, -1.5, -0.5)

  bindKeys(game.controlState.current)
  bindMouse(game.controlState.current)

  let isFirst = true
  let then = 0
  let deltaTime = 0
  return {
    resize: () => {
      rootRenderer.dispose()
      tileRenderer.dispose()
      waterRenderer.dispose()
      buildingRenderer.dispose()
      objectPickerRenderer.dispose()
      gui.dispose()
      tileRenderer = createLandscapeRenderer(gl, resources)
      buildingRenderer = createBuildingRenderer(gl, resources)
      waterRenderer = createWaterRenderer(gl, resources)
      rootRenderer = createRootRenderer(gl, resources, (projectionMatrix, game, timeDelta) => {
        tileRenderer.render(projectionMatrix, game)
        waterRenderer.render(projectionMatrix, game, timeDelta)
        buildingRenderer.render(projectionMatrix, game)
      })
      gui = createRuntime(
        gl,
        resources,
        gl.canvas.width,
        gl.canvas.height,
        () => testGui(game),
        (name) => resources.guiTextures[name],
        game.simulation.landscape.size * game.simulation.landscape.size + 1, // start the gui object IDs after the landscape picker number range
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

      gameLoop(gl, resources, game, deltaTime)
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
            const p = getPositionFromObjectId(game.selectedObjectId, game.simulation.landscape.size)
            if (game.gui.selection === null) {
              switch (toolMode) {
                case ToolSelectionMode.Prefab:
                  const blueprint = blueprintFromTool(game.gui.currentTool)
                  if (blueprint) {
                    game.gui.selection = {
                      start: { ...p },
                      end: { x: p.x + blueprint.footprint.width - 1, y: p.y + blueprint.footprint.height - 1 },
                    }
                  }
                  break
                default:
                  game.gui.selection = { start: { ...p }, end: { ...p } }
              }
            } else {
              switch (toolMode) {
                case ToolSelectionMode.Prefab:
                  const w = game.gui.selection.end.x - game.gui.selection.start.x
                  const h = game.gui.selection.end.y - game.gui.selection.start.y
                  game.gui.selection.start = { ...p }
                  game.gui.selection.end.x = p.x + w
                  game.gui.selection.end.y = p.y + h
                  break
                case ToolSelectionMode.Range:
                  if (toolIsAxisLocked(game.gui.currentTool)) {
                    if (game.gui.selection.end.x !== game.gui.selection.start.x) {
                      game.gui.selection.end.x = p.x
                    } else if (game.gui.selection.end.y !== game.gui.selection.start.y) {
                      game.gui.selection.end.y = p.y
                    } else {
                      if (p.x !== game.gui.selection.start.x && p.y !== game.gui.selection.start.y) {
                        game.gui.selection.end.x = p.x
                      } else {
                        game.gui.selection.end = { ...p }
                      }
                    }
                  } else {
                    game.gui.selection.end = { ...p }
                  }
                  break
                case ToolSelectionMode.Single:
                  game.gui.selection = { start: { ...p }, end: { ...p } }
                  break
              }
            }
          }
        }

        if (!game.controlState.current.mouseButtons.left && game.controlState.previous.mouseButtons.left) {
          applyTool(gl, game, resources)
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
