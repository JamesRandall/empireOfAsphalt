import { RenderingModel } from "../resources/models"
import { Building } from "./building"

export enum TerrainTypeEnum {
  Plain = 0,
  Grass = 1,
}

export enum ElevatedZoneEnum {
  None = 0,
  PowerLine = 1,
}

export enum ZoneEnum {
  None = 0,
  LightResidential = 1,
  DenseResidential = 2,
  LightCommercial = 3,
  DenseCommercial = 4,
  LightIndustrial = 5,
  DenseIndustrial = 6,
  Road = 7,
  CoalPowerPlant = 8,
}

// these are in the order of the landscape.png texture set
export enum LandscapeTexture {
  RoadNorthSouth = 0,
  RoadEastWest = 1,
  RoadNorthEast = 2,
  RoadNorthWest = 3,
  RoadNorthToEastWest = 4,
  RoadWestToNorthSouth = 5,
  RoadSouthEast = 6,
  RoadSouthWest = 7,
  RoadEastTNorthSouth = 8,
  RoadSouthTEastWest = 9,
  RoadCrossroads = 10,
  RoadNorthStub = 11,
  RoadSouthStub = 12,
  RoadWestStub = 13,
  RoadEastStub = 14,
  RoadIsolate = 15,
}

export interface TileInfo {
  terrain: TerrainTypeEnum
  zone: ZoneEnum
  elevatedZone: ElevatedZoneEnum
  isFlat: boolean
  textureIndex: LandscapeTexture | null
  building?: Building
  isPowered: Boolean
}

export interface Landscape {
  heights: number[][]
  size: number
  tileInfo: TileInfo[][]
  chunkSize: number
  chunks: {
    fromX: number
    fromY: number
    model: RenderingModel
  }[]
}
