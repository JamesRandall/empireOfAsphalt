import { createRectRenderer } from "./rectangle"
import { createCircleRenderer } from "./circle"
import { createTextRenderer } from "./text"
import { vec2, vec4 } from "gl-matrix"
import { Resources } from "../../resources/resources"
import { createTexturedRectRenderer } from "./texturedRectangle"
import { Texture } from "../../resources/texture"

export interface Primitives {
  rect: (position: vec2, size: vec2, color: vec4) => void
  texturedRect: (position: vec2, size: vec2, texture: Texture) => void
  circle: (position: vec2, radius: number, color: vec4) => void
  text: {
    draw: (text: string, position: vec2, color?: vec4) => void
    measure: (text: string) => { width: number; height: number }
    convertToCharacterCoordinates: (position: vec2) => vec2
    convertToPosition: (characterPosition: vec2) => vec2
    drawAtSize: (text: string, position: vec2, cw: number, ch: number, spacing: number, color: vec4) => void
    center: (text: string, row: number, color?: vec4) => void
    fontSize: { width: number; height: number }
  }
  size: () => { width: number; height: number }
}

export function createPrimitiveRenderer(
  gl: WebGL2RenderingContext,
  flippedY: boolean,
  resources: Resources,
  width: number,
  height: number,
): Primitives {
  return {
    rect: createRectRenderer(gl, width, height, resources),
    texturedRect: createTexturedRectRenderer(gl, width, height, resources),
    circle: createCircleRenderer(gl, width, height, resources),
    text: createTextRenderer(gl, width, height, false, resources),
    size: () => ({ width: width, height: height }),
  }
}
