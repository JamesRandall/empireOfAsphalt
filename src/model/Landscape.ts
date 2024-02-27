import { RenderingModel } from "../resources/models"

export enum TerrainTypeEnum {
  Grass,
}
export interface Landscape {
  heights: number[][]
  size: number
  terrainType: TerrainTypeEnum[][]
  chunkSize: number
  chunks: {
    fromX: number
    fromY: number
    model: RenderingModel
  }[]
}
