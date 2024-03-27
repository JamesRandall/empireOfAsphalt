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
}

export interface TileInfo {
  terrain: TerrainTypeEnum
  zone: ZoneEnum
  isFlat: boolean
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
