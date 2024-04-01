import { compileShaderProgram2 } from "./coregl/shader"
import { mat4 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { sizes } from "../constants"
import { objectIdToVec4, rectFromRange } from "../utilities"
import { toolAllowsSlopedSelection } from "../tools/utilities"

function initShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.building)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix")!,
      lightWorldPosition: gl.getUniformLocation(shaderProgram, "uLightWorldPosition")!,
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

export function createBuildingRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!
  const pickerProgramInfo = initPickerShaderProgram(gl, resources)!

  const dispose = () => {}
  const render = (projectionMatrix: mat4, game: Game) => {
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)

    const building = resources.buildings.house

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

    building.renderingModels.forEach((chunk) => {
      setCommonAttributes(gl, chunk, programInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indices)

      const vertexCount = chunk.vertexCount
      const type = gl.UNSIGNED_SHORT
      const offset = 0
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
    gl.disable(gl.CULL_FACE)
  }
  const renderObjectPicker = (projectionMatrix: mat4, game: Game) => {
    const building = resources.buildings.house
    gl.useProgram(pickerProgramInfo.program)

    let worldMatrix = mat4.create()

    setViewUniformLocations(gl, pickerProgramInfo, {
      projectionMatrix,
      modelViewMatrix: worldMatrix,
    })
    building.renderingModels.forEach((chunk) => {
      setCommonAttributes(gl, chunk, pickerProgramInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indices)

      const vertexCount = chunk.vertexCount
      const type = gl.UNSIGNED_SHORT
      const offset = 0
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
  }

  return { dispose, render, renderObjectPicker }
}
