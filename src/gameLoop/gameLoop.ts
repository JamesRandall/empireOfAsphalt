import { Game } from "../model/game"
import { constructBuildings } from "./construction"
import { applyControlState } from "./applyControlState"
import { glMatrix } from "gl-matrix"
import { updatePowerGrid } from "../simulation/power"
import { applyTime } from "../simulation/time"
import { applyGrowth } from "../simulation/growth"
import { Resources } from "../resources/resources"
import { simulate } from "../simulation/simulate"
import { updateRendererTileInfo } from "../resources/landscape"

const radiansPerSecond = glMatrix.toRadian(90)

function updatePowerRendering(gl: WebGL2RenderingContext, game: Game, timeDelta: number) {
  game.powerPulse.level += timeDelta * radiansPerSecond
  if (game.powerPulse.level > Math.PI * 2) {
    game.powerPulse.level -= Math.PI * 2
  }
  game.powerPulse.opacity = ((Math.sin(game.powerPulse.level) + 1) / 2) * 0.4 + 0.6

  const landscape = game.simulation.landscape
  let minZ = landscape.size
  let minX = landscape.size
  let maxZ = -1
  let maxX = -1
  for (let z = 0; z < landscape.size - 1; z++) {
    for (let x = 0; x < landscape.size - 1; x++) {
      const ti = landscape.tileInfo[z][x]
      if (ti.wasPoweredByBuildingId !== ti.isPoweredByBuildingId) {
        minZ = Math.min(z, minZ)
        minX = Math.min(x, minX)
        maxZ = Math.max(z, maxZ)
        maxX = Math.max(x, maxX)
      }
    }
  }
  if (maxZ !== -1) {
    updateRendererTileInfo(gl, game, { start: { x: minX, y: minZ }, end: { x: maxX, y: maxZ } })
  }
}

export function gameLoop(gl: WebGL2RenderingContext, resources: Resources, game: Game, timeDelta: number) {
  simulate(game.difficultyLevel, game.simulation, timeDelta)

  updatePowerRendering(gl, game, timeDelta)
  applyControlState(game, timeDelta)
  constructBuildings(game.simulation, resources, timeDelta)
}
