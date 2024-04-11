import { compileShaderProgram2 } from "./coregl/shader"
import { mat4 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { sizes } from "../constants"
import { objectIdToVec4, rectFromRange } from "../utilities"
import { toolAllowsSlopedSelection } from "../tools/utilities"
import { voxelModelForBuilding } from "../model/building"

function initShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.water)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      objectInfo: gl.getAttribLocation(shaderProgram, "aObjectInfo"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix")!,
      lightWorldPosition: gl.getUniformLocation(shaderProgram, "uLightWorldPosition")!,
      opacity: gl.getUniformLocation(shaderProgram, "uOpacity")!,
      zoom: gl.getUniformLocation(shaderProgram, "uZoom")!,
      tileSize: gl.getUniformLocation(shaderProgram, "uTileSize")!,
      voxelsPerTile: gl.getUniformLocation(shaderProgram, "uVoxelsPerTile")!,
      waveOffset: gl.getUniformLocation(shaderProgram, "uWaveOffset")!,
    },
  }
}

function initPickerShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.objectPicking)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      objectIdColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
    },
  }
}

export function createWaterRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!
  const pickerProgramInfo = initPickerShaderProgram(gl, resources)!

  const dispose = () => {}
  let time = 0
  const render = (projectionMatrix: mat4, game: Game, timeDelta: number) => {
    time += timeDelta ?? 0
    gl.useProgram(programInfo.program)
    const lightPosition = game.buildingLight.direction
    let worldMatrix = mat4.create()
    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, worldMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      modelViewMatrix: worldMatrix,
      normalMatrix,
      lightWorldPosition: lightPosition,
    })

    gl.uniform1f(programInfo.uniformLocations.opacity, 1.0)
    gl.uniform1f(programInfo.uniformLocations.zoom, game.view.zoom)
    gl.uniform1f(programInfo.uniformLocations.tileSize, sizes.tile)
    gl.uniform1f(programInfo.uniformLocations.voxelsPerTile, 4.0)
    gl.uniform1f(programInfo.uniformLocations.waveOffset, (time * 1.5) % 8)

    game.landscape.water.chunks.forEach((chunk) => {
      const vertexCount = chunk.model.vertexCount
      setCommonAttributes(gl, chunk.model, programInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.model.indices)

      const type = gl.UNSIGNED_SHORT
      const offset = 0

      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
  }
  const renderObjectPicker = (projectionMatrix: mat4, game: Game) => {}

  return { dispose, render, renderObjectPicker }
}
