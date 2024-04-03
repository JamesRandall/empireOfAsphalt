import { VoxelModel } from "../resources/voxelModel"
import { Resources } from "../resources/resources"
import { Tool } from "./game"
import { ZoneEnum } from "./Landscape"

let nextBuildingId = 1

export interface Blueprint {
  getModel: (resources: Resources) => VoxelModel
  footprint: {
    width: number
    height: number
  }
}

export interface Building {
  buildingId: number
  model: VoxelModel
  footprint: {
    width: number
    height: number
  }
  position: { x: number; z: number }
  numberOfVoxelsToDisplay: number
}

const blueprints: [Tool, Blueprint][] = [
  [Tool.CoalPowerPlant, { getModel: (r: Resources) => r.voxelModels.power.coal, footprint: { width: 4, height: 4 } }],
]
const blueprintsMap = new Map<Tool, Blueprint>(blueprints)

export function blueprintFromTool(tool: Tool) {
  return blueprintsMap.get(tool)
}

export function createBuildingFromTool(resources: Resources, tool: Tool, position: { x: number; z: number }) {
  const blueprint = blueprintsMap.get(tool)
  if (blueprint === undefined) return null
  return createBuildingFromBlueprint(resources, blueprint, position)
}

export function createBuildingFromBlueprint(
  resources: Resources,
  blueprint: Blueprint,
  position: { x: number; z: number },
) {
  const model = blueprint.getModel(resources)
  return {
    buildingId: nextBuildingId++,
    model: model,
    footprint: { ...blueprint.footprint },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
  } as Building
}

export function createBuildingForZone(
  resources: Resources,
  zone: ZoneEnum,
  size: number,
  position: { x: number; z: number },
) {
  const model = resources.voxelModels.residential.house
  return {
    buildingId: nextBuildingId++,
    model: model,
    footprint: { width: size, height: size },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
  } as Building
}

export function createBuilding(
  model: VoxelModel,
  width: number,
  height: number,
  x: number,
  z: number,
  numberOfVoxelsToDisplay: number,
) {
  return {
    buildingId: nextBuildingId++,
    model,
    footprint: { width, height },
    position: { x, z },
    numberOfVoxelsToDisplay,
  } as Building
}
