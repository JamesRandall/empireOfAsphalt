import { VoxelModel } from "../resources/voxelModel"
import { Resources } from "../resources/resources"
import { Tool } from "./game"
import { ZoneEnum } from "./Landscape"

export interface Blueprint {
  getModel: (resources: Resources) => VoxelModel
  footprint: {
    width: number
    height: number
  }
}

export interface Building {
  model: VoxelModel
  footprint: {
    width: number
    height: number
  }
  position: { x: number; z: number }
  numberOfVoxelsToDisplay: number
}

const buildings: [Tool, Blueprint][] = [
  [Tool.CoalPowerPlant, { getModel: (r: Resources) => r.voxelModels.power.coal, footprint: { width: 4, height: 4 } }],
]
const buildingsMap = new Map<Tool, Blueprint>(buildings)

export function blueprintFromTool(tool: Tool) {
  return buildingsMap.get(tool)
}

export function buildingFromTool(resources: Resources, tool: Tool, position: { x: number; z: number }) {
  const blueprint = buildingsMap.get(tool)
  if (blueprint === undefined) return null
  return createBuilding(resources, blueprint, position)
}

export function createBuilding(resources: Resources, blueprint: Blueprint, position: { x: number; z: number }) {
  const model = blueprint.getModel(resources)
  return {
    model: model,
    footprint: { ...blueprint.footprint },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
  } as Building
}

export function buildingForZone(
  resources: Resources,
  zone: ZoneEnum,
  size: number,
  position: { x: number; z: number },
) {
  const model = resources.voxelModels.residential.house
  return {
    model: model,
    footprint: { width: size, height: size },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
  } as Building
}
