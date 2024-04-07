import { Game } from "../model/game"
import { constructBuildings } from "./construction"
import { applyControlState } from "./applyControlState"
import { glMatrix } from "gl-matrix"
import { updatePowerGrid } from "./power"
import { applyTime } from "./time"
import { applyGrowth } from "../simulation/growth"
import { Resources } from "../resources/resources"

const radiansPerSecond = glMatrix.toRadian(90)

function updatePowerPulse(game: Game, timeDelta: number) {
  game.powerPulse.level += timeDelta * radiansPerSecond
  if (game.powerPulse.level > Math.PI * 2) {
    game.powerPulse.level -= Math.PI * 2
  }
  game.powerPulse.opacity = ((Math.sin(game.powerPulse.level) + 1) / 2) * 0.4 + 0.6
}

export function gameLoop(gl: WebGL2RenderingContext, resources: Resources, game: Game, timeDelta: number) {
  const { isNewDay, isNewWeek, isNewMonth } = applyTime(game, timeDelta)
  if (isNewDay) {
    console.log("D")
    updatePowerGrid(gl, game)
  }
  if (isNewWeek) {
    console.log("W")
    applyGrowth(game, resources)
  }

  updatePowerPulse(game, timeDelta)
  applyControlState(game, timeDelta)
  constructBuildings(game, timeDelta)
}
