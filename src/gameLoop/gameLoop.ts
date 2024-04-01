import { Game } from "../model/game"
import { constructBuildings } from "./construction"
import { applyControlState } from "./applyControlState"

export function gameLoop(game: Game, timeDelta: number) {
  applyControlState(game, timeDelta)
  constructBuildings(game, timeDelta)
}
