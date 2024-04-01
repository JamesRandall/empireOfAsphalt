import { VoxelModel } from "../resources/voxelModel"

export interface Building {
  model: VoxelModel
  footprint: {
    width: number
    height: number
  }
  position: { x: number; z: number }
  numberOfVoxelsToDisplay: number
}
