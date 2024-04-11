import { Building } from "../model/building"
import { Simulation } from "../model/simulation"

export function addBuildingToSimulation(simulation: Simulation, building: Building) {
  simulation.buildings.set(building.buildingId, building)
  for (let z = building.position.z; z < building.position.z + building.blueprint.footprint.height; z++) {
    for (let x = building.position.x; x < building.position.x + building.blueprint.footprint.width; x++) {
      simulation.landscape.tileInfo[z][x].building = building
    }
  }
}

export function removeBuildingFromSimulation(simulation: Simulation, building: Building) {
  for (let z = 0; z < building.blueprint.footprint.height; z++) {
    for (let x = 0; x < building.blueprint.footprint.width; x++) {
      simulation.landscape.tileInfo[building.position.z + z][building.position.x + x].building = null
    }
  }
  simulation.buildings.delete(building.buildingId)
}
