import { Game } from "../model/game"
import { timings } from "../constants"
import { voxelModelForBuilding } from "../model/building"
import { Resources } from "../resources/resources"

//let timeUntilNextVoxel = 1.0 / timings.buildSpeedVoxelsPerSecond
let timeSinceLastConstruction = 0.0
export function constructBuildings(game: Game, resources: Resources, timeDelta: number) {
  timeSinceLastConstruction += timeDelta
  const voxelsToDraw = Math.floor(timeSinceLastConstruction * timings.buildSpeedVoxelsPerSecond)
  if (voxelsToDraw > 0) {
    timeSinceLastConstruction = 0
    game.buildings.forEach((building) => {
      const model = voxelModelForBuilding(building)(resources)
      if (building.numberOfVoxelsToDisplay < model.voxelCount) {
        building.numberOfVoxelsToDisplay = Math.min(building.numberOfVoxelsToDisplay + voxelsToDraw, model.voxelCount)
      }
    })
  }
}
