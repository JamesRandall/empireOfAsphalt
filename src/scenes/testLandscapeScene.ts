import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"

export function createTestLandscapeScene(gl: WebGL2RenderingContext, resources: Resources) {
  let rootRenderer = createRootRenderer(gl, resources, createTileRenderer(gl, resources))
  const game = {}
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

      rootRenderer.render(game, deltaTime, RenderEffect.None)
      return null
    },
  }
}
