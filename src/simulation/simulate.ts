import { DifficultyLevel } from "../model/game"
import { Simulation } from "../model/simulation"
import { updateValves } from "./valves"
import { clearCensus } from "./census"
import { applyTime } from "./time"
import { updatePowerGrid } from "./power"

export function simulate(difficultyLevel: DifficultyLevel, simulation: Simulation, timeDelta: number) {
  const { isNewDay, isNewWeek, isNewMonth } = applyTime(simulation, timeDelta)

  if (isNewDay) {
    updatePowerGrid(simulation)
  }
  if (isNewWeek) {
    console.log("W")
    //applyGrowth(game, resources)
  }

  // In the original game a month lasts around 8 seconds at normal speed and the valves update
  // roughly every 2 seconds
  updateValves(difficultyLevel, simulation)
  clearCensus(simulation)
}
