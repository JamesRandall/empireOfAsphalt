import { VoxelModel } from "../resources/voxelModel"
import { Resources } from "../resources/resources"
import { Tool } from "./game"

import { ZoneEnum } from "./Tile"
import { RenderingModel } from "../resources/models"

let nextBuildingId = 1

export enum BuildingType {
  CoalPowerStation = 0,
  PowerLine = 1,
  SmallHouse,
  SmallChemicalStorage,
}

export enum BlueprintCategory {
  Residential,
  Industrial,
  Commercial,
  Other,
}

export interface Blueprint {
  blueprintCategory: BlueprintCategory
  isHeavyIndustrial: boolean
  output: number
  buildingType: BuildingType
  footprint: {
    width: number
    height: number
  }
  powerGenerated: number
  powerConsumed: number
  growthCap: number | null // buildings can have their own growth cap by type, if none is specified the growth cap for the zone is used
}

export interface Building {
  buildingId: number
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

const zeroOutput = () => ({ residential: 0, industrial: 0, commercial: 0 })

const blueprintModels: [BuildingType, (r: Resources) => VoxelModel][] = [
  [BuildingType.CoalPowerStation, (r: Resources) => r.voxelModels.power.coal],
  [BuildingType.PowerLine, (r: Resources) => r.voxelModels.power.powerLineEastWest],
  [BuildingType.SmallHouse, (r: Resources) => r.voxelModels.residential.house],
  [BuildingType.SmallChemicalStorage, (r: Resources) => r.voxelModels.industrial.smallChemicalStorage],
]
const blueprints: [BuildingType, Blueprint][] = [
  [
    BuildingType.CoalPowerStation,
    {
      blueprintCategory: BlueprintCategory.Other,
      buildingType: BuildingType.CoalPowerStation,
      footprint: { width: 4, height: 4 },
      powerGenerated: 2000,
      powerConsumed: 0,
      output: 0,
      isHeavyIndustrial: false,
      growthCap: null,
    },
  ],
  [
    BuildingType.PowerLine,
    {
      blueprintCategory: BlueprintCategory.Other,
      buildingType: BuildingType.PowerLine,
      footprint: { width: 1, height: 1 },
      powerGenerated: 0,
      powerConsumed: 0,
      output: 0,
      isHeavyIndustrial: false,
      growthCap: null,
    },
  ],
  [
    BuildingType.SmallHouse,
    {
      blueprintCategory: BlueprintCategory.Residential,
      buildingType: BuildingType.SmallHouse,
      footprint: { width: 1, height: 1 },
      powerGenerated: 0,
      powerConsumed: 10,
      output: 0,
      isHeavyIndustrial: false,
      growthCap: null,
    },
  ],
  [
    BuildingType.SmallChemicalStorage,
    {
      blueprintCategory: BlueprintCategory.Industrial,
      buildingType: BuildingType.SmallChemicalStorage,
      footprint: { width: 1, height: 1 },
      powerGenerated: 0,
      powerConsumed: 30,
      output: 10,
      isHeavyIndustrial: false,
      growthCap: null,
    },
  ],
]
const blueprintsMap = new Map<BuildingType, Blueprint>(blueprints)
const blueprintsModelsMap = new Map(blueprintModels)
const blueprintsList = blueprints.map(([_, blueprint]) => blueprint)
const blueprintsForCategory = new Map<BlueprintCategory, Blueprint[]>(
  [
    BlueprintCategory.Other,
    BlueprintCategory.Residential,
    BlueprintCategory.Commercial,
    BlueprintCategory.Industrial,
  ].map((bc) => [bc, blueprintsList.filter((bp) => bp.blueprintCategory === bc)]),
)

export function voxelModelForBuilding(building: Building) {
  return blueprintsModelsMap.get(building.blueprint.buildingType)!
}

export function voxelModelForBlueprint(blueprint: Blueprint) {
  return blueprintsModelsMap.get(blueprint.buildingType)!
}

export function blueprintsForCategoryAndGrowth(category: BlueprintCategory, growthScore: number) {
  return (
    blueprintsForCategory
      .get(category)
      ?.filter((bp) => bp.output <= growthScore)
      .sort((a, b) => a.output - b.output) ?? []
  )
}

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
  const model = blueprintsModelsMap.get(blueprint.buildingType)!(resources)
  return {
    blueprint: blueprint,
    buildingId: nextBuildingId++,
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
  const blueprint = blueprintsMap.get(BuildingType.SmallHouse)!
  const model = blueprintsModelsMap.get(blueprint.buildingType)!(resources)
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
    footprint: { width, height },
    position: { x, z },
    numberOfVoxelsToDisplay,
    isPoweredByBuildingId: null,
  } as Building
}
