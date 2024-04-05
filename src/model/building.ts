import { VoxelModel } from "../resources/voxelModel"
import { Resources } from "../resources/resources"
import { Tool } from "./game"
import { ZoneEnum } from "./Landscape"

let nextBuildingId = 1

export enum BuildingType {
  CoalPowerStation = 0,
  PowerLine = 1,
  SmallHouse,
}

export interface Blueprint {
  buildingType: BuildingType
  getModel: (resources: Resources) => VoxelModel
  footprint: {
    width: number
    height: number
  }
  powerGenerated: number
  powerConsumed: number
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
  isPoweredByBuildingId: number | null // we track if a building is powered and if it is by which power station
  blueprint: Blueprint
}

const toolBuildingTypes: [Tool, BuildingType][] = [
  [Tool.CoalPowerPlant, BuildingType.CoalPowerStation],
  [Tool.PowerLine, BuildingType.PowerLine],
]
const toolBuildingTypesMap = new Map<Tool, BuildingType>(toolBuildingTypes)

const blueprints: [BuildingType, Blueprint][] = [
  [
    BuildingType.CoalPowerStation,
    {
      buildingType: BuildingType.CoalPowerStation,
      getModel: (r: Resources) => r.voxelModels.power.coal,
      footprint: { width: 4, height: 4 },
      powerGenerated: 2000,
      powerConsumed: 0,
    },
  ],
  [
    BuildingType.PowerLine,
    {
      buildingType: BuildingType.PowerLine,
      getModel: (r: Resources) => r.voxelModels.power.powerLineEastWest,
      footprint: { width: 1, height: 1 },
      powerGenerated: 0,
      powerConsumed: 0,
    },
  ],
  [
    BuildingType.SmallHouse,
    {
      buildingType: BuildingType.SmallHouse,
      getModel: (r: Resources) => r.voxelModels.power.coal,
      footprint: { width: 1, height: 1 },
      powerGenerated: 0,
      powerConsumed: 10,
    },
  ],
]
const blueprintsMap = new Map<BuildingType, Blueprint>(blueprints)

export function blueprintFromTool(tool: Tool) {
  const buildingType = toolBuildingTypesMap.get(tool)!
  return blueprintsMap.get(buildingType)
}

export function blueprintForBuilding(buildingType: BuildingType) {
  return blueprintsMap.get(buildingType)
}

export function createBuildingFromTool(resources: Resources, tool: Tool, position: { x: number; z: number }) {
  const buildingType = toolBuildingTypesMap.get(tool)!
  const blueprint = blueprintsMap.get(buildingType)
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
    blueprint: blueprint,
    buildingId: nextBuildingId++,
    model: model,
    footprint: { ...blueprint.footprint },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
    isPoweredByBuildingId: null,
  } as Building
}

export function createBuildingForZone(
  resources: Resources,
  zone: ZoneEnum,
  size: number,
  position: { x: number; z: number },
) {
  const blueprint = blueprintsMap.get(BuildingType.SmallHouse)
  const model = resources.voxelModels.residential.house
  return {
    blueprint: blueprint,
    buildingId: nextBuildingId++,
    model: model,
    footprint: { width: size, height: size },
    position,
    numberOfVoxelsToDisplay: model.voxelCount,
    isPoweredByBuildingId: null,
  } as Building
}

export function createBuilding(
  model: VoxelModel,
  blueprint: Blueprint,
  width: number,
  height: number,
  x: number,
  z: number,
  numberOfVoxelsToDisplay: number,
) {
  return {
    blueprint: blueprint,
    buildingId: nextBuildingId++,
    model,
    footprint: { width, height },
    position: { x, z },
    numberOfVoxelsToDisplay,
    isPoweredByBuildingId: null,
  } as Building
}
