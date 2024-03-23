import { vec4 } from "gl-matrix"
import { HorizontalAlignment, SizeToFit } from "./gui/base"

export function objectIdToVec4(objectId: number) {
  return vec4.fromValues(
    ((objectId >> 0) & 0xff) / 0xff,
    ((objectId >> 8) & 0xff) / 0xff,
    ((objectId >> 16) & 0xff) / 0xff,
    ((objectId >> 24) & 0xff) / 0xff,
  )
}

export function objectIdFromArray(data: Uint8Array) {
  return data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)
}

export function horizontalAlignment(value: "left" | "middle" | "right") {
  switch (value) {
    case "middle":
      return HorizontalAlignment.Middle
    case "right":
      return HorizontalAlignment.Right
    default:
      return HorizontalAlignment.Left
  }
}

export function sizeToFit(value: "none" | "width" | "height" | "widthAndHeight") {
  switch (value) {
    case "width":
      return SizeToFit.Width
    case "height":
      return SizeToFit.Height
    case "widthAndHeight":
      return SizeToFit.WidthAndHeight
    case "none":
      return SizeToFit.None
  }
}
