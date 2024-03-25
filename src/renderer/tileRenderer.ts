import { compileShaderProgram2 } from "./coregl/shader"
import { mat4 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { sizes } from "../constants"
import { objectIdToVec4 } from "../utilities"

function initShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.directional)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      objectIdColor: gl.getAttribLocation(shaderProgram, "aTileId"),
      objectInfo: gl.getAttribLocation(shaderProgram, "aObjectInfo"),
      textureCoords: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      worldMatrix: gl.getUniformLocation(shaderProgram, "uWorldMatrix")!,
      viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix")!,
      lightWorldPosition: gl.getUniformLocation(shaderProgram, "uLightWorldPosition")!,
      lineColorPosition: gl.getUniformLocation(shaderProgram, "uLineColor")!,
      zoomedTileSize: gl.getUniformLocation(shaderProgram, "uZoomedTileSize"),
      uSelectedTileId: gl.getUniformLocation(shaderProgram, "uSelectedTileId"),
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

export function createTileRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!
  const pickerProgramInfo = initPickerShaderProgram(gl, resources)!

  const dispose = () => {}
  const render = (projectionMatrix: mat4, game: Game) => {
    gl.useProgram(programInfo.program)
    const lightPosition = game.light.position

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
    const selectedObjectId = objectIdToVec4(game.selectedObjectId ?? -1)
    gl.uniform4fv(programInfo.uniformLocations.uSelectedTileId, selectedObjectId)
    gl.uniform1f(programInfo.uniformLocations.zoomedTileSize, sizes.tile * 1.5)
    gl.uniform4fv(programInfo.uniformLocations.lineColorPosition, [120.0 / 255.0, 92.0 / 255.0, 40.0 / 255.0, 1.0])

    game.landscape.chunks.forEach((chunk) => {
      setCommonAttributes(gl, chunk.model, programInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.model.indices)

      const vertexCount = chunk.model.vertexCount
      const type = gl.UNSIGNED_SHORT
      const offset = 0
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
  }
  const renderObjectPicker = (projectionMatrix: mat4, game: Game) => {
    gl.useProgram(pickerProgramInfo.program)

    let worldMatrix = mat4.create()

    setViewUniformLocations(gl, pickerProgramInfo, {
      projectionMatrix,
      modelViewMatrix: worldMatrix,
    })
    game.landscape.chunks.forEach((chunk) => {
      setCommonAttributes(gl, chunk.model, pickerProgramInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.model.indices)

      const vertexCount = chunk.model.vertexCount
      const type = gl.UNSIGNED_SHORT
      const offset = 0
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
  }

  return { dispose, render, renderObjectPicker }
}
