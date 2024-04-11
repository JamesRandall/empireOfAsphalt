import { RenderingModel } from "../resources/models"
import { Water } from "../resources/water"
import { TileInfo } from "./Tile"

export interface Landscape {
  chunkSize: number
  chunks: {
    fromX: number
    fromY: number
    model: RenderingModel
  }[]
  water: Water
}
