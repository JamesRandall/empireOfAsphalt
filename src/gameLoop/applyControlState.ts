import { Game } from "../model/game"
import { map } from "../constants"
import { glMatrix, mat4, vec3 } from "gl-matrix"

export function applyControlState(game: Game, timeDelta: number) {
  const speed = map.movementSpeedTilesPerSecond * timeDelta * (map.maxZoom - game.view.zoom)
  const delta = vec3.create()
  if (game.controlState.current.mapForwards) {
    vec3.add(delta, delta, [0, -speed, 0])
  } else if (game.controlState.current.mapBackwards) {
    vec3.add(delta, delta, [0, speed, 0])
  }
  if (game.controlState.current.mapLeft) {
    vec3.add(delta, delta, [speed, 0, 0])
  } else if (game.controlState.current.mapRight) {
    vec3.add(delta, delta, [-speed, 0, 0])
  }

  if (game.view.targetRotation === null) {
    if (game.controlState.current.mapRotateAnticlockwise && !game.controlState.previous.mapRotateAnticlockwise) {
      game.view.targetRotation = game.view.rotation + 90
    }
    if (game.controlState.current.mapRotateClockwise && !game.controlState.previous.mapRotateClockwise) {
      game.view.targetRotation = game.view.rotation - 90
    }
  }

  vec3.add(game.view.position, game.view.position, delta)
  game.view.zoom += game.controlState.current.mouseZoom * 0.01
  if (game.view.zoom < map.minZoom) game.view.zoom = map.minZoom
  else if (game.view.zoom > map.maxZoom) game.view.zoom = map.maxZoom

  game.controlState.current.mouseZoom = 0
  game.controlState.previous = { ...game.controlState.current }
}
