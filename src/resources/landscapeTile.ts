import { vec3, vec4 } from "gl-matrix"
import { sizes } from "../constants"
import { RenderingModel } from "./models"

function calculateTriangleNormal(v1: vec3, v2: vec3, v3: vec3) {
  const edge1 = vec3.subtract(vec3.create(), v2, v1)
  const edge2 = vec3.subtract(vec3.create(), v3, v1)
  const normal = vec3.cross(vec3.create(), edge1, edge2)
  vec3.normalize(normal, normal)
  return normal
}

interface HeightCount {
  height: number
  count: number
}

function getHeightCount(heights: number[]) {
  const result = new Map<number, HeightCount>()
  const max = { height: -1, count: -1 }
  heights.forEach((h) => {
    let c = result.get(h)
    if (c === undefined) {
      c = { height: h, count: 0 }
      result.set(h, c)
    }
    c.count++
    if (c.count > max.count) {
      max.count = c.count
      max.height = c.height
    }
  })
  const min = { height: -1, count: 10000 }
  result.forEach((r) => {
    if (r.count < min.count) {
      min.height = r.height
      min.count = r.count
    }
  })
  return {
    heights: result,
    max: max,
    min: min,
  }
}

function getAsRollingArray<T>(items: T[], index: number) {
  if (index < 0) {
    index = items.length + index
  }
  if (index >= items.length) {
    index = index - items.length
  }
  return items[index]
}

export function createLandscape(gl: WebGL2RenderingContext, heights: number[][]) {
  const positions: number[] = []
  const indices: number[] = []

  const normals: number[] = []
  const textureCoords: number[] = []
  const colors: number[] = []

  const half = sizes.tile / 2
  const faceIndices = [0, 1, 2, 3, 4, 5] //[3, 0, 1, 3, 1, 2]
  const standardTextureCoords =
    // [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]
    [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]
  const grass = vec4.fromValues(0, 0.8, 0, 1)
  const water = vec4.fromValues(0, 0, 1, 1)
  const desert = vec4.fromValues(1, 1, 0, 1)
  const fire = vec4.fromValues(1, 0, 0, 1)

  const leftExtent = (sizes.tile * heights[0].length) / 2
  const topExtent = (-sizes.tile * heights[0].length) / 2

  for (let y = 0; y < heights.length - 1; y++) {
    let rowTopHeights = heights[y]
    let rowBottomHeights = heights[y + 1]

    const top = -sizes.tile * y - topExtent
    for (let x = 0; x < rowTopHeights.length - 1; x++) {
      const left = sizes.tile * x - leftExtent
      const indexOffset = positions.length / 3
      const cellHeights = [rowTopHeights[x], rowTopHeights[x + 1], rowBottomHeights[x + 1], rowBottomHeights[x]]
      const v = [
        vec3.fromValues(-half + left, rowTopHeights[x], half + top), // tl
        vec3.fromValues(half + left, rowTopHeights[x + 1], half + top), // tr
        vec3.fromValues(half + left, rowBottomHeights[x + 1], -half + top), //br
        vec3.fromValues(-half + left, rowBottomHeights[x], -half + top), // bl
      ]

      // Any landscape tiles that have two faces (saddle, 3-high etc,) need forming from specifically arranged
      // triangles so that the normals can be set correctly
      const groupedHeights = getHeightCount(cellHeights)
      if (groupedHeights.max.count === 3) {
        // we're dealing with a "3-high" or a "1-high"
        // first we get the centerpoint - this is the index of the height with the lowest count, the high point or low point
        const centerIndex = cellHeights.indexOf(groupedHeights.min.height)
        const oppositeIndex = centerIndex - 2
        // build a triangle around the center
        const t1 = [
          getAsRollingArray(v, centerIndex - 1),
          getAsRollingArray(v, centerIndex),
          getAsRollingArray(v, centerIndex + 1),
        ]
        const t2 = [
          getAsRollingArray(v, oppositeIndex - 1),
          getAsRollingArray(v, oppositeIndex),
          getAsRollingArray(v, oppositeIndex + 1),
        ]
        const n1 = calculateTriangleNormal(t1[0], t1[1], t1[2])
        const n2 = calculateTriangleNormal(t2[0], t2[1], t2[2])
        const combinedVertex = [...t1, ...t2]
        const combinedNormals = [n1, n1, n1, n2, n2, n2]

        combinedVertex.flatMap((p) => [p[0], p[1], p[2]]).forEach((p) => positions.push(p))
        combinedNormals.flatMap((n) => [n[0], n[1], n[2]]).forEach((n) => normals.push(n))
        faceIndices.forEach((i) => indices.push(i + indexOffset))
      } else {
        const tilePositions = [
          v[3][0], // bl
          v[3][1],
          v[3][2],
          v[0][0], // tl
          v[0][1],
          v[0][2],
          v[1][0], // tr
          v[1][1],
          v[1][2],
          v[3][0], // bl
          v[3][1],
          v[3][2],
          v[1][0], // tr
          v[1][1],
          v[1][2],
          v[2][0], // br
          v[2][1],
          v[2][2],
        ]

        tilePositions.forEach((p) => positions.push(p))
        faceIndices.forEach((i) => indices.push(i + indexOffset))

        const n1 = calculateTriangleNormal(v[3], v[0], v[1])
        const n2 = calculateTriangleNormal(v[3], v[1], v[2])
        normals.push(n1[0])
        normals.push(n1[1])
        normals.push(n1[2])
        normals.push(n1[0])
        normals.push(n1[1])
        normals.push(n1[2])
        normals.push(n1[0])
        normals.push(n1[1])
        normals.push(n1[2])
        normals.push(n2[0])
        normals.push(n2[1])
        normals.push(n2[2])
        normals.push(n2[0])
        normals.push(n2[1])
        normals.push(n2[2])
        normals.push(n2[0])
        normals.push(n2[1])
        normals.push(n2[2])
      }
      standardTextureCoords.forEach((stc) => textureCoords.push(stc))
      for (let v = 0; v < 6; v++) {
        //let color = x === 0 ? water : y === 0 ? desert : y === 1 ? fire : grass
        let color = grass
        colors.push(color[0])
        colors.push(color[1])
        colors.push(color[2])
        colors.push(color[3])
      }
    }
  }

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
  //const outlineColorBuffer = gl.createBuffer()
  //gl.bindBuffer(gl.ARRAY_BUFFER, outlineColorBuffer)
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outlineColors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}

export function createTile(
  gl: WebGL2RenderingContext,
  color: vec4,
  heights: {
    topLeft: number
    topRight: number
    bottomLeft: number
    bottomRight: number
  },
) {
  const half = sizes.tile / 2
  const positions = [
    -half,
    heights.topLeft,
    -half,
    half,
    heights.topRight,
    -half,
    half,
    heights.bottomRight,
    half,
    -half,
    heights.bottomLeft,
    half,
  ]
  const indices = [3, 0, 1, 3, 1, 2]
  //const normals = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  const normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]
  const textureCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]
  const colors = [
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
    color[0],
    color[1],
    color[2],
    color[3],
  ]

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  const colorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}
