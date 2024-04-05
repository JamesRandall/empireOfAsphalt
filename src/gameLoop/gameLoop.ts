import { Game } from "../model/game"
import { constructBuildings } from "./construction"
import { applyControlState } from "./applyControlState"
import { glMatrix } from "gl-matrix"
import { updatePowerGrid } from "./power"

const radiansPerSecond = glMatrix.toRadian(90)

function updatePowerPulse(game: Game, timeDelta: number) {
  game.powerPulse.level += timeDelta * radiansPerSecond
  if (game.powerPulse.level > Math.PI * 2) {
    game.powerPulse.level -= Math.PI * 2
  }
  game.powerPulse.opacity = ((Math.sin(game.powerPulse.level) + 1) / 2) * 0.4 + 0.6
}

export function gameLoop(game: Game, timeDelta: number) {
  updatePowerGrid(game) // we won't need to run this every turn
  updatePowerPulse(game, timeDelta)
  applyControlState(game, timeDelta)
  constructBuildings(game, timeDelta)
}
