import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"
import { createGameWithLandscape } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { vec3 } from "gl-matrix"
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
