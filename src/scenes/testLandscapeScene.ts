import { Resources } from "../resources/resources"
import { createRootRenderer, RenderEffect } from "../renderer/rootRenderer"
import { createTileRenderer } from "../renderer/tileRenderer"
import { Game, getDefaultGame, RotationEnum } from "../model/game"
import { bindKeys } from "../controls/bindKeys"
import { glMatrix, vec3 } from "gl-matrix"
import { map, sizes } from "../constants"
import { generateHeightMap } from "../proceduralGeneration/generateLandscape"
import { createLandscape } from "../resources/landscapeTile"

function applyControlState(game: Game, timeDelta: number) {
  const speed = map.movementSpeedTilesPerSecond * timeDelta * game.camera.zoom
  const delta = vec3.create()
  if (game.controlState.current.mapForwards) {
    vec3.add(delta, delta, [0, speed, 0])
  } else if (game.controlState.current.mapBackwards) {
    vec3.add(delta, delta, [0, -speed, 0])
  }
  if (game.controlState.current.mapLeft) {
    const left = vec3.fromValues(-speed, -speed / 2, 0)
    vec3.rotateY(left, left, [0, 0, 0], glMatrix.toRadian(90 * game.camera.rotation))
    vec3.add(delta, delta, left)
  } else if (game.controlState.current.mapRight) {
    const right = vec3.fromValues(speed, speed / 2, 0)
    vec3.rotateY(right, right, [0, 0, 0], glMatrix.toRadian(90 * game.camera.rotation))
    vec3.add(delta, delta, right)
  }

  if (game.controlState.current.mapRotateClockwise && !game.controlState.previous.mapRotateClockwise) {
    vec3.rotateY(game.camera.lookAt, game.camera.lookAt, game.camera.position, glMatrix.toRadian(90))
    game.camera.rotation += 1
    if (game.camera.rotation > RotationEnum.West) {
      game.camera.rotation = RotationEnum.North
    }
  }
  if (game.controlState.current.mapRotateAnticlockwise && !game.controlState.previous.mapRotateAnticlockwise) {
    vec3.rotateY(game.camera.lookAt, game.camera.lookAt, game.camera.position, glMatrix.toRadian(-90))
    game.camera.rotation -= 1
    if (game.camera.rotation < RotationEnum.North) {
      game.camera.rotation = RotationEnum.West
    }
  }

  vec3.add(game.camera.lookAt, game.camera.lookAt, delta)
  vec3.add(game.camera.position, game.camera.position, delta)
}

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

  game.terrain.size = 32
  //game.terrain.heightMap = threeHigh2
  game.terrain.heightMap = generateHeightMap(game.terrain.size)
  game.terrain.model = createLandscape(gl, game.terrain.heightMap)
  game.light.position = vec3.fromValues(-0.5, -0.25, -0.5) // this is a direction if we use a directional light
  game.camera.zoom = 1.5
  bindKeys(game.controlState.current)

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

      game.controlState.previous = { ...game.controlState.current }
      return null
    },
  }
}
