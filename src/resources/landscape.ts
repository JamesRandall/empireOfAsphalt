import { vec3, vec4 } from "gl-matrix"
import { sizes } from "../constants"
import { RenderingModel } from "./models"
import { ElevatedZoneEnum, Landscape, TerrainTypeEnum, TileInfo, ZoneEnum } from "../model/Landscape"
import { objectIdToVec4, rectFromRange } from "../utilities"
import { Range } from "../model/range"

const chunkSize = 32

function getChunksForRange(landscape: Landscape, range: Range) {
  const r = rectFromRange(range)
  return landscape.chunks.filter(
    (c) => c.fromX <= r.right && c.fromX + chunkSize >= r.left && c.fromY <= r.bottom && c.fromY + chunkSize >= r.top,
  )
}

function vecFromTileInfo(tileInfo: TileInfo) {
  // I can imagine us eventually having enough info that we have to bit twiddle it in
  return [
    vec4.fromValues(
      tileInfo.terrain,
      tileInfo.zone,
      tileInfo.isFlat ? 1.0 : 0.0,
      tileInfo.isPoweredByBuildingId !== null ? 1.0 : 0.0,
    ),
    vec4.fromValues((tileInfo.textureIndex ?? -1.0) + 1.0, tileInfo.elevatedZone, 0.0, 0.0),
  ]
}

export function updateRendererTileInfo(gl: WebGL2RenderingContext, landscape: Landscape, range: Range) {
  const chunks = getChunksForRange(landscape, range)
  chunks.forEach((chunk) => {
    const toX = Math.min(landscape.size - 1, chunk.fromX + chunkSize - 1)
    const toY = Math.min(landscape.size - 1, chunk.fromY + chunkSize - 1)
    const tileInfos: number[] = []
    const additionalTileInfos: number[] = []
    for (let y = chunk.fromY; y <= toY; y++) {
      let row = landscape.tileInfo[y]
      for (let x = chunk.fromX; x <= toX; x++) {
        const tileInfo = row[x]
        // I can imagine us eventually having enough info that we have to bit twiddle it in
        const [vectorTileInfo, vectorAdditionalTileInfo] = vecFromTileInfo(tileInfo)
        for (let v = 0; v < 6; v++) {
          tileInfos.push(vectorTileInfo[0])
          tileInfos.push(vectorTileInfo[1])
          tileInfos.push(vectorTileInfo[2])
          tileInfos.push(vectorTileInfo[3])
          additionalTileInfos.push(vectorAdditionalTileInfo[0])
          additionalTileInfos.push(vectorAdditionalTileInfo[1])
          additionalTileInfos.push(vectorAdditionalTileInfo[2])
          additionalTileInfos.push(vectorAdditionalTileInfo[3])
        }
      }
    }
    gl.deleteBuffer(chunk.model.objectInfo)
    gl.deleteBuffer(chunk.model.additionalObjectInfo)

    const tileInfoBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, tileInfoBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileInfos), gl.STATIC_DRAW)
    chunk.model.objectInfo = tileInfoBuffer

    const additionalTileInfoBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, additionalTileInfoBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(additionalTileInfos), gl.STATIC_DRAW)
    chunk.model.additionalObjectInfo = additionalTileInfoBuffer
  })
}

// Index buffers have a max index of 64k as they are unsigned shorts - our large landscapes are bigger than that
// so we chunk them up - doing ths will probably help us with terrain levelling performance in any case as we'll
// have less geometry to update

export function createLandscape(gl: WebGL2RenderingContext, heights: number[][]) {
  let heightMapSize = heights.length
  const landscape: Landscape = {
    heights: heights,
    tileInfo: [],
    chunkSize: chunkSize,
    chunks: [],
    size: heightMapSize,
  }
  for (let y = 0; y < heightMapSize - 1; y++) {
    const row: TileInfo[] = []
    for (let x = 0; x < heightMapSize - 1; x++) {
      const isFlat =
        heights[y][x] == heights[y][x + 1] &&
        heights[y][x] == heights[y + 1][x] &&
        heights[y][x] == heights[y + 1][x + 1]
      row.push({
        terrain: TerrainTypeEnum.Plain,
        zone: ZoneEnum.None,
        elevatedZone: ElevatedZoneEnum.None,
        isFlat,
        textureIndex: null,
        isPoweredByBuildingId: null,
        wasPoweredByBuildingId: null,
        building: null,
      })
    }
    landscape.tileInfo.push(row)
  }
  for (let y = 0; y < heightMapSize - 1; y += chunkSize) {
    for (let x = 0; x < heightMapSize - 1; x += chunkSize) {
      const toX = Math.min(heightMapSize - 1, x + chunkSize - 1)
      const toY = Math.min(heightMapSize - 1, y + chunkSize - 1)
      const chunk = {
        fromX: x,
        fromY: y,
        model: createLandscapeChunk(gl, heights, landscape.tileInfo, x, y, toX, toY, heightMapSize),
      }
      landscape.chunks.push(chunk)
    }
  }
  return landscape
}

function createLandscapeChunk(
  gl: WebGL2RenderingContext,
  heights: number[][],
  tileInfo: TileInfo[][],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  heightMapSize: number,
) {
  const positions: number[] = []
  const indices: number[] = []

  const normals: number[] = []
  const textureCoords: number[] = []
  const colors: number[] = []
  const tileInfos: number[] = []
  const additionalTileInfos: number[] = []
  const objectIdColors: number[] = []

  const half = sizes.tile / 2
  const faceIndices = [0, 1, 2, 3, 4, 5] //[3, 0, 1, 3, 1, 2]
  const dirt = vec4.fromValues(152.0 / 255.0, 132.0 / 255.0, 68.0 / 255.0, 1.0)

  const leftExtent = (sizes.tile * heights[0].length) / 2
  const topExtent = (-sizes.tile * heights[0].length) / 2

  for (let y = fromY; y <= toY; y++) {
    let rowTopHeights = heights[y]
    let rowBottomHeights = heights[y + 1]
    if (rowBottomHeights === undefined) debugger
    let rowZones = tileInfo[y]

    const top = -sizes.tile * y - topExtent
    for (let x = fromX; x <= toX; x++) {
      const objectId = y * heightMapSize + x
      const objectIdColor = objectIdToVec4(objectId)
      const left = sizes.tile * x - leftExtent
      const indexOffset = positions.length / 3
      const cellHeights = [rowTopHeights[x], rowTopHeights[x + 1], rowBottomHeights[x + 1], rowBottomHeights[x]]
      const v = [
        vec3.fromValues(-half + left, rowTopHeights[x], half + top), // tl
        vec3.fromValues(half + left, rowTopHeights[x + 1], half + top), // tr
        vec3.fromValues(half + left, rowBottomHeights[x + 1], -half + top), //br
        vec3.fromValues(-half + left, rowBottomHeights[x], -half + top), // bl
      ]
      const tileInfo = rowZones[x]
      // I can imagine us eventually having enough info that we have to bit twiddle it in
      const [vectorTileInfo, vectorAdditionalTileInfo] = vecFromTileInfo(tileInfo)

      const vertexTextureCoords = [
        [0.0, 1.0],
        [1.0, 1.0],
        [1.0, 0.0],
        [0.0, 0.0],
      ]

      // Any landscape tiles that have two faces (saddle, 3-high etc,) need forming from specifically arranged
      // triangles so that the normals can be set correctly
      const groupedHeights = getHeightCount(cellHeights)
      if (groupedHeights.min.count === 2 && groupedHeights.max.count === 2 && heightsAlternate(cellHeights)) {
        const firstLowPoint = cellHeights.indexOf(groupedHeights.min.height)
        const t1 = [
          getAsRollingArray(v, firstLowPoint),
          getAsRollingArray(v, firstLowPoint + 1),
          getAsRollingArray(v, firstLowPoint + 2),
        ]
        const t2 = [
          getAsRollingArray(v, firstLowPoint),
          getAsRollingArray(v, firstLowPoint - 2),
          getAsRollingArray(v, firstLowPoint - 1),
        ]
        const n1 = calculateTriangleNormal(t1[0], t1[1], t1[2])
        const n2 = calculateTriangleNormal(t2[0], t2[1], t2[2])
        const combinedVertex = [...t1, ...t2]
        const combinedNormals = [n1, n1, n1, n2, n2, n2]

        combinedVertex.flatMap((p) => [p[0], p[1], p[2]]).forEach((p) => positions.push(p))
        combinedNormals.flatMap((n) => [n[0], n[1], n[2]]).forEach((n) => normals.push(n))
        faceIndices.forEach((i) => indices.push(i + indexOffset))
        const shapeTextureCoords = [
          getAsRollingArray(vertexTextureCoords, firstLowPoint),
          getAsRollingArray(vertexTextureCoords, firstLowPoint + 1),
          getAsRollingArray(vertexTextureCoords, firstLowPoint + 2),
          getAsRollingArray(vertexTextureCoords, firstLowPoint),
          getAsRollingArray(vertexTextureCoords, firstLowPoint - 2),
          getAsRollingArray(vertexTextureCoords, firstLowPoint - 1),
        ]
        shapeTextureCoords.flatMap((tc) => tc).forEach((tc) => textureCoords.push(tc))
      } else if (groupedHeights.max.count === 3) {
        // we're dealing with a "3-high" or a "1-high"
        // first we get the center point - this is the index of the height with the lowest count,
        // the high point or low point
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
        const shapeTextureCoords = [
          getAsRollingArray(vertexTextureCoords, centerIndex - 1),
          getAsRollingArray(vertexTextureCoords, centerIndex),
          getAsRollingArray(vertexTextureCoords, centerIndex + 1),
          getAsRollingArray(vertexTextureCoords, oppositeIndex - 1),
          getAsRollingArray(vertexTextureCoords, oppositeIndex),
          getAsRollingArray(vertexTextureCoords, oppositeIndex + 1),
        ]
        shapeTextureCoords.flatMap((tc) => tc).forEach((tc) => textureCoords.push(tc))
      } else {
        const vertexIndices = [3, 0, 1, 3, 1, 2]
        const tilePositions = vertexIndices.flatMap((vi) => [v[vi][0], v[vi][1], v[vi][2]])
        tilePositions.forEach((p) => positions.push(p))
        faceIndices.forEach((i) => indices.push(i + indexOffset))
        vertexIndices
          .map((vi) => vertexTextureCoords[vi])
          .flatMap((vtc) => [vtc[0], vtc[1]])
          .forEach((vtc) => textureCoords.push(vtc))
        const n1 = calculateTriangleNormal(v[3], v[0], v[1])
        faceIndices.flatMap((_) => [n1[0], n1[1], n1[2]]).forEach((n) => normals.push(n))
      }

      for (let v = 0; v < 6; v++) {
        // useful for finding saddles
        // let color = x === 127 && y === 84 ? fire : grass
        const color = dirt
        colors.push(color[0])
        colors.push(color[1])
        colors.push(color[2])
        colors.push(color[3])

        objectIdColors.push(objectIdColor[0])
        objectIdColors.push(objectIdColor[1])
        objectIdColors.push(objectIdColor[2])
        objectIdColors.push(objectIdColor[3])

        tileInfos.push(vectorTileInfo[0])
        tileInfos.push(vectorTileInfo[1])
        tileInfos.push(vectorTileInfo[2])
        tileInfos.push(vectorTileInfo[3])
        additionalTileInfos.push(vectorAdditionalTileInfo[0])
        additionalTileInfos.push(vectorAdditionalTileInfo[1])
        additionalTileInfos.push(vectorAdditionalTileInfo[2])
        additionalTileInfos.push(vectorAdditionalTileInfo[3])
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
  const tileInfoBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tileInfoBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileInfos), gl.STATIC_DRAW)
  const additionalTileInfoBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, additionalTileInfoBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(additionalTileInfos), gl.STATIC_DRAW)
  const objectIdColorBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, objectIdColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectIdColors), gl.STATIC_DRAW)
  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    color: colorBuffer,
    objectIdColor: objectIdColorBuffer,
    objectInfo: tileInfoBuffer,
    additionalObjectInfo: additionalTileInfoBuffer,
    indices: indexBuffer,
    normals: normalBuffer,
    vertexCount: indices.length,
    textureCoords: textureCoordBuffer,
    texture: null,
  } as RenderingModel
}

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

function heightsAlternate(heights: number[]) {
  if (heights.length < 2) return true

  let currentValue = heights[0]
  for (let i = 1; i < heights.length; i++) {
    const nextValue = heights[i]
    if (currentValue === nextValue) {
      return false
    }
    currentValue = nextValue
  }

  return true
}
