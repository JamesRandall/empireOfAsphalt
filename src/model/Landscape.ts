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

// these are in the order of the landscape.png texture set
export enum LandscapeTexture {
  RoadNorthSouth = 0,
  RoadEastWest = 1,
  RoadNorthEast = 2,
  RoadNorthWest = 3,
  RoadNorthTEastWest = 4,
  RoadWestTNorthSouth = 5,
  RoadSouthEast = 6,
  RoadSouthWest = 7,
  RoadEastTNorthSouth = 8,
  RoadSouthTEastWest = 9,
  RoadCrossroads = 10,
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
