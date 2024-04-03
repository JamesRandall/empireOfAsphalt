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
      opacity: gl.getUniformLocation(shaderProgram, "uOpacity")!,
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

    gl.useProgram(programInfo.program)
    const lightPosition = game.buildingLight.direction
    game.buildings.forEach((building) => {
      //for (const building of game.buildings.values()) {
      let worldMatrix = mat4.create()
      mat4.translate(worldMatrix, worldMatrix, [
        (building.position.x - game.landscape.size / 2) * sizes.tile - sizes.tile / 2,
        0,
        (game.landscape.size / 2 - building.position.z) * sizes.tile - sizes.tile / 2,
      ])

      const normalMatrix = mat4.create()
      mat4.invert(normalMatrix, worldMatrix)
      mat4.transpose(normalMatrix, normalMatrix)

      setViewUniformLocations(gl, programInfo, {
        projectionMatrix,
        modelViewMatrix: worldMatrix,
        normalMatrix,
        lightWorldPosition: lightPosition,
      })

      let voxelOffset = 0

      if (building.blueprint.powerGenerated === 0 && !building.isPowered) {
        gl.uniform1f(programInfo.uniformLocations.opacity, game.powerPulse.opacity)
      } else {
        gl.uniform1f(programInfo.uniformLocations.opacity, 1.0)
      }

      building.model.renderingModels.forEach((chunk) => {
        const numberOfVoxelsInChunk = chunk.vertexCount / 36
        const vertexCount =
          voxelOffset + numberOfVoxelsInChunk < building.numberOfVoxelsToDisplay
            ? chunk.vertexCount
            : (building.numberOfVoxelsToDisplay - voxelOffset) * 36
        setCommonAttributes(gl, chunk, programInfo)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indices)

        const type = gl.UNSIGNED_SHORT
        const offset = 0

        // The below will draw transparent buildings as a placeholder while they are, errr, building
        //if (vertexCount / 36 < building.model.voxelCount) {
        //  gl.uniform1f(programInfo.uniformLocations.opacity, 0.02)
        //  gl.drawElements(gl.TRIANGLES, chunk.vertexCount, type, offset)
        //}

        voxelOffset += numberOfVoxelsInChunk

        if (vertexCount <= 0) return
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
      })
    })
    gl.disable(gl.CULL_FACE)
  }
  const renderObjectPicker = (projectionMatrix: mat4, game: Game) => {
    gl.useProgram(pickerProgramInfo.program)
    game.buildings.forEach((building) => {
      let worldMatrix = mat4.create()

      setViewUniformLocations(gl, pickerProgramInfo, {
        projectionMatrix,
        modelViewMatrix: worldMatrix,
      })
      building.model.renderingModels.forEach((chunk) => {
        setCommonAttributes(gl, chunk, pickerProgramInfo)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.indices)

        const vertexCount = chunk.vertexCount
        const type = gl.UNSIGNED_SHORT
        const offset = 0
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
      })
    })
  }

  return { dispose, render, renderObjectPicker }
}
