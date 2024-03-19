import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"
import { createGameWithLandscape, Game } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { glMatrix, mat4, vec3, vec4 } from "gl-matrix"
import { generateHeightMap } from "../proceduralGeneration/generateLandscape"
import { createLandscape } from "../resources/landscape"
import { bindMouse } from "../controls/bindMouse"
import { applyControlState } from "../gameLoop/applyControlState"

export function createTestLandscapeScene(gl: WebGL2RenderingContext, resources: Resources) {
  let rootRenderer = createRootRenderer(gl, resources, createTileRenderer(gl, resources))
  const heightmap = generateHeightMap(256)
  const landscape = createLandscape(gl, heightmap)
  const game = createGameWithLandscape(landscape)

  game.light.position = vec3.fromValues(-0.5, -0.25, -0.5) // this is a direction if we use a directional light
  game.view.zoom = 1.5
  bindKeys(game.controlState.current)
  bindMouse(game.controlState.current)

  let isFirst = true
  let then = 0
  let deltaTime = 0
  return {
    resize: () => {
      rootRenderer.dispose()
      rootRenderer = createRootRenderer(gl, resources, createTileRenderer(gl, resources))
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
      applyRotation(game, deltaTime)
      rootRenderer.render(game, deltaTime, RenderEffect.None)

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
