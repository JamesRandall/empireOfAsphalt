import { compileShaderProgram, compileShaderProgram2, loadShader } from "./coregl/shader"
import { glMatrix, mat4, quat, vec3, vec4 } from "gl-matrix"
import { setColorAttribute, setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { createLandscape, createTile } from "../resources/landscapeTile"
import { sizes } from "../constants"

function initOutlineShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.uColor)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      color: gl.getUniformLocation(shaderProgram, "uColor")!,
    },
  }
}

function initShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.lighting)
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
      shininess: gl.getUniformLocation(shaderProgram, "uShininess")!,
    },
  }
}

export function createTileRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!
  const outlineProgramInfo = initOutlineShaderProgram(gl, resources)!

  const grassTile = createTile(gl, [0.0, 1.0, 0.0, 1.0], {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  })
  const waterTile = createTile(gl, [0.0, 0.0, 1.0, 1.0], {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  })
  const h = 16
  const landscape = createLandscape(gl, [
    [0, h, h, 0, 0],
    [0, h, h, 0, 0],
    [0, 0, 0, 0, h],
    [0, 0, 0, 0, h],
  ])

  return function (projectionMatrix: mat4, game: Game) {
    gl.useProgram(programInfo.program)
    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      lightWorldPosition: [1000, 100, 1000],
    })

    const tile = landscape

    const modelViewMatrix = mat4.create()
    const zoom = 4
    mat4.rotateX(modelViewMatrix, modelViewMatrix, glMatrix.toRadian(35.264)) // Tilt
    mat4.rotateY(modelViewMatrix, modelViewMatrix, glMatrix.toRadian(45))
    mat4.scale(modelViewMatrix, modelViewMatrix, [zoom, zoom, zoom])
    mat4.translate(modelViewMatrix, modelViewMatrix, [sizes.tile, 0, -sizes.tile])

    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, modelViewMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    setCommonAttributes(gl, tile, programInfo)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tile.indices)
    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      modelViewMatrix,
      normalMatrix,
      shininess: 16.0,
    })
    const vertexCount = tile.vertexCount
    const type = gl.UNSIGNED_SHORT
    const offset = 0
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)

    gl.useProgram(outlineProgramInfo.program)
    setCommonAttributes(gl, tile, outlineProgramInfo)
    setViewUniformLocations(gl, outlineProgramInfo, {
      projectionMatrix,
      modelViewMatrix,
      color: vec4.fromValues(0, 0, 0, 1),
    })
    //gl.disable(gl.DEPTH_TEST)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tile.outlineIndices!)
    gl.drawElements(gl.LINE_STRIP, tile.outlineVertexCount!, type, offset)
  }
}
