import { RenderingModel } from "../resources/models"

export enum TerrainTypeEnum {
  Plain = 0,
  Grass = 1,
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
}

export enum LandscapeTexture {
  RoadNorthSouth = 0,
  RoadEastWest = 1,
  RoadNorthEast = 2,
  RoadSouthEast = 3,
  RoadSouthWest = 4,
  RoadNorthWest = 5,
  RoadCrossroads = 6,
  RoadNorthTEastWest = 7,
  RoadSouthTEastWest = 8,
  RoadEastTNorthSouth = 9,
  RoadWestTNorthSource = 10,
}

export interface TileInfo {
  terrain: TerrainTypeEnum
  zone: ZoneEnum
  isFlat: boolean
  textureIndex: LandscapeTexture | null
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
