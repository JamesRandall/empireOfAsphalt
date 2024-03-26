import { vec4 } from "gl-matrix"

import { Attributes } from "./builder"

export function vec4FromNumber(value: number) {
  return vec4.fromValues(
    ((value >> 24) & 0xff) / 0xff,
    ((value >> 16) & 0xff) / 0xff,
    ((value >> 8) & 0xff) / 0xff,
    ((value >> 0) & 0xff) / 0xff,
  )
}

export function numberFromVec4(value: vec4) {
  return (
    Math.floor(value[3] * 255.0) +
    (Math.floor(value[2] * 255.0) << 8) +
    (Math.floor(value[1] * 255.0) << 16) +
    (Math.floor(value[0] * 255.0) << 24)
  )
}
export function attributeOrDefault<T>(attributes: Attributes | undefined, key: string, defaultValue: T) {
  if (attributes === undefined) return defaultValue
  const attribute = attributes[key]
  if (attribute === undefined) return defaultValue
  return attribute as T
}
