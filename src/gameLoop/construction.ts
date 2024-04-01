import { Game } from "../model/game"
import { timings } from "../constants"

//let timeUntilNextVoxel = 1.0 / timings.buildSpeedVoxelsPerSecond
let timeSinceLastConstruction = 0.0
export function constructBuildings(game: Game, timeDelta: number) {
  timeSinceLastConstruction += timeDelta
  const voxelsToDraw = Math.floor(timeSinceLastConstruction * timings.buildSpeedVoxelsPerSecond)
  if (voxelsToDraw > 0) {
    timeSinceLastConstruction = 0
    game.buildings.forEach((building) => {
      if (building.numberOfVoxelsToDisplay < building.model.voxelCount) {
        building.numberOfVoxelsToDisplay = Math.min(
          building.numberOfVoxelsToDisplay + voxelsToDraw,
          building.model.voxelCount,
        )
      }
    })
  }
}
