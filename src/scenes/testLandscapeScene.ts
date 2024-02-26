import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"
import { Game, getDefaultGame, RotationEnum } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { glMatrix, vec3 } from "gl-matrix"
import { map, sizes } from "../constants"
import { generateHeightMap } from "../proceduralGeneration/generateLandscape"
import { createLandscape } from "../resources/landscape"
import { bindMouse } from "../controls/bindMouse"
import { applyControlState } from "../gameLoop/applyControlState"

export function createTestLandscapeScene(gl: WebGL2RenderingContext, resources: Resources) {
  let rootRenderer = createRootRenderer(gl, resources, createTileRenderer(gl, resources))
  const game = getDefaultGame()
  const threeHigh = [
    [16, 16],
    [0, 16],
  ]
  const threeHigh2 = [
    [0, 16],
    [16, 16],
  ]

  game.terrain.size = 128
  //game.terrain.heightMap = threeHigh2
  game.terrain.heightMap = generateHeightMap(game.terrain.size)
  game.terrain.model = createLandscape(gl, game.terrain.heightMap)
  game.light.position = vec3.fromValues(-0.5, -0.25, -0.5) // this is a direction if we use a directional light
  game.camera.zoom = 1.5
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
      rootRenderer.render(game, deltaTime, RenderEffect.None)

      return null
    },
  }
}
