import { vec4 } from "gl-matrix"

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
