import { Game, RotationEnum } from "../model/game"
import { map } from "../constants"
import { glMatrix, vec3 } from "gl-matrix"

export function applyControlState(game: Game, timeDelta: number) {
  const speed = map.movementSpeedTilesPerSecond * timeDelta * (map.maxZoom - game.camera.zoom)
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
  game.camera.zoom += game.controlState.current.mouseZoom * 0.01
  if (game.camera.zoom < map.minZoom) game.camera.zoom = map.minZoom
  else if (game.camera.zoom > map.maxZoom) game.camera.zoom = map.maxZoom

  game.controlState.current.mouseZoom = 0
  game.controlState.previous = { ...game.controlState.current }
}
