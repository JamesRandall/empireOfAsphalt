export interface ControlProperties {
  id: number
  type: string
  x?: number
  y?: number
  width?: number
  height?: number
  children?: ControlProperties[]
}

export interface ButtonProperties extends ControlProperties {
  image?: string
}
