import { loadTexture, Texture } from "./texture"
import { createSoundEffects, SoundEffects } from "../audio"
import { ShaderSource } from "../renderer/coregl/shader"
import { loadVoxelModel, VoxelModel } from "./voxelModel"
import { Building } from "../model/building"

export interface Resources {
  textures: {
    grass: Texture
    dirt: Texture
    font: Texture
    noise: Texture
    landscape: Texture
  }
  guiTextures: {
    [id: string]: Texture
  }
  voxelModels: {
    residential: {
      house: VoxelModel
    }
    power: {
      coal: VoxelModel
      powerLineCrossRoads: VoxelModel
      powerLineEastT: VoxelModel
      powerLineEastWest: VoxelModel
      powerLineNorthEast: VoxelModel
      powerLineNorthSouth: VoxelModel
      powerLineNorthT: VoxelModel
      powerLineNorthWest: VoxelModel
      powerLineSouthEast: VoxelModel
      powerLineSouthT: VoxelModel
      powerLineSouthWest: VoxelModel
      powerLineWestT: VoxelModel
      powerLineRoadEastWest: VoxelModel
      powerLineRoadNorthSouth: VoxelModel
    }
    misc: {
      sphere: VoxelModel
    }
  }
  shaderSource: {
    uColor: ShaderSource
    text: ShaderSource
    simpleTexture: ShaderSource
    crt: ShaderSource
    amberCrt: ShaderSource
    greenCrt: ShaderSource
    vcr: ShaderSource
    motionBlur: ShaderSource
    directional: ShaderSource
    objectPicking: ShaderSource
    building: ShaderSource
    water: ShaderSource
  }
  soundEffects: SoundEffects
}

async function loadShaderSource(name: string) {
  const fragResponse = await fetch(`shaders/${name}.frag`)
  const vertResponse = await fetch(`shaders/${name}.vert`)
  return {
    frag: await fragResponse.text(),
    vert: await vertResponse.text(),
  }
}

export async function loadResources(gl: WebGL2RenderingContext): Promise<Resources> {
  const shaderNames = [
    "uColor",
    "text",
    "simpleTexture",
    "crt",
    "ambercrt",
    "greencrt",
    "vcr",
    "motionblur",
    "directional",
    "objectPicking",
    "building",
    "water",
  ]
  const guiTextureNames = [
    "road",
    "bulldozer",
    "pause",
    "singlespeed",
    "doublespeed",
    "zones",
    "xmark",
    "lightResidentialZone",
    "denseResidentialZone",
    "lightCommercialZone",
    "denseCommercialZone",
    "lightIndustrialZone",
    "denseIndustrialZone",
    "lowerTerrain",
    "raiseTerrain",
    "dezone",
    "clearTerrain",
    "power",
    "powerLine",
    "coalPowerPlant",
    "gasPowerPlant",
    "nuclearPowerPlant",
    "solarPowerPlant",
    "windTurbine",
    "info",
    "layers",
    "whiteLayers",
    "whiteBuildings",
    "whiteElectric",
    "whiteZones",
  ]
  const textureNames = ["grass", "dirt", "font", "noise", "landscape"]
  const buildingNames = [
    "smallHouse1",
    "coalPower",
    "sphere",
    "powerLineCrossRoads",
    "powerLineEastT",
    "powerLineEastWest",
    "powerLineNorthEast",
    "powerLineNorthSouth",
    "powerLineNorthT",
    "powerLineNorthWest",
    "powerLineSouthEast",
    "powerLineSouthT",
    "powerLineSouthWest",
    "powerLineWestT",
    "powerLineRoadEastWest",
    "powerLineRoadNorthSouth",
  ]

  const loadedBuildings = await Promise.all(buildingNames.map((bn) => loadVoxelModel(gl, bn)))
  const buildingsMap = new Map<string, VoxelModel>(loadedBuildings.map((vm, i) => [buildingNames[i], vm]))

  const loadedShaders = await Promise.all(shaderNames.map((sn) => loadShaderSource(sn)))
  const namedShaders = new Map<string, ShaderSource>(shaderNames.map((sn, index) => [sn, loadedShaders[index]]))
  const loadedTextures = await Promise.all(textureNames.map((tn) => loadTexture(gl, `./${tn}.png`)))
  const textures = new Map<string, Texture>(loadedTextures.map((t, i) => [textureNames[i], t]))
  let guiTextureObj: { [id: string]: Texture } = {}

  const guiTextures = await Promise.all(guiTextureNames.map((tn) => loadTexture(gl, `./gui/${tn}.png`)))
  guiTextures.forEach((t, i) => (guiTextureObj[guiTextureNames[i]] = t))

  return {
    textures: {
      grass: textures.get("grass")!,
      dirt: textures.get("dirt")!,
      font: textures.get("font")!,
      noise: textures.get("noise")!,
      landscape: textures.get("landscape")!,
    },
    guiTextures: guiTextureObj,
    shaderSource: {
      uColor: namedShaders.get("uColor")!,
      text: namedShaders.get("text")!,
      simpleTexture: namedShaders.get("simpleTexture")!,
      crt: namedShaders.get("crt")!,
      amberCrt: namedShaders.get("ambercrt")!,
      greenCrt: namedShaders.get("greencrt")!,
      vcr: namedShaders.get("vcr")!,
      motionBlur: namedShaders.get("motionblur")!,
      directional: namedShaders.get("directional")!,
      objectPicking: namedShaders.get("objectPicking")!,
      building: namedShaders.get("building")!,
      water: namedShaders.get("water")!,
    },
    soundEffects: await createSoundEffects(),
    voxelModels: {
      residential: {
        house: buildingsMap.get("smallHouse1")!,
      },
      power: {
        coal: buildingsMap.get("coalPower")!,
        powerLineCrossRoads: buildingsMap.get("powerLineCrossRoads")!,
        powerLineEastT: buildingsMap.get("powerLineEastT")!,
        powerLineEastWest: buildingsMap.get("powerLineEastWest")!,
        powerLineNorthEast: buildingsMap.get("powerLineNorthEast")!,
        powerLineNorthSouth: buildingsMap.get("powerLineNorthSouth")!,
        powerLineNorthT: buildingsMap.get("powerLineNorthT")!,
        powerLineNorthWest: buildingsMap.get("powerLineNorthWest")!,
        powerLineSouthEast: buildingsMap.get("powerLineSouthEast")!,
        powerLineSouthT: buildingsMap.get("powerLineSouthT")!,
        powerLineSouthWest: buildingsMap.get("powerLineSouthWest")!,
        powerLineWestT: buildingsMap.get("powerLineWestT")!,
        powerLineRoadNorthSouth: buildingsMap.get("powerLineRoadNorthSouth")!,
        powerLineRoadEastWest: buildingsMap.get("powerLineRoadEastWest")!,
      },
      misc: {
        sphere: buildingsMap.get("sphere")!,
      },
    },
  }
}
