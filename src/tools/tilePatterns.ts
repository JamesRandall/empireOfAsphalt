import { Game } from "../model/game"
import { TileInfo, ZoneEnum } from "../model/Landscape"

export const tilePatterns = {
  northSouth: [
    [0, 1, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  eastWest: [
    [0, 0, 0],
    [1, 0, 1],
    [0, 0, 0],
  ],
  northEast: [
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
  ],
  northWest: [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
  ],
  northT: [
    [0, 0, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  westT: [
    [0, 1, 0],
    [1, 0, 0],
    [0, 1, 0],
  ],
  southWest: [
    [0, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
  ],
  southEast: [
    [0, 1, 0],
    [0, 0, 1],
    [0, 0, 0],
  ],
  eastT: [
    [0, 1, 0],
    [0, 0, 1],
    [0, 1, 0],
  ],
  southT: [
    [0, 1, 0],
    [1, 0, 1],
    [0, 0, 0],
  ],
  crossroads: [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ],
  northStub: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ],
  southStub: [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  westStub: [
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, 0],
  ],
  eastStub: [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 0],
  ],
  isolate: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
}

export function getPattern(game: Game, x: number, y: number, isSet: (tileInfo: TileInfo) => Boolean) {
  const tileInfos = game.landscape.tileInfo

  const pattern = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  if (y > 0) {
    pattern[0][1] = isSet(tileInfos[y - 1][x]) ? 1 : 0
  }
  if (y < game.landscape.size - 1) {
    pattern[2][1] = isSet(tileInfos[y + 1][x]) ? 1 : 0
  }
  if (x > 0) {
    pattern[1][0] = isSet(tileInfos[y][x - 1]) ? 1 : 0
  }
  if (x < game.landscape.size - 1) {
    pattern[1][2] = isSet(tileInfos[y][x + 1]) ? 1 : 0
  }
  return pattern
}

export function isMatchingPattern(patternA: number[][], patternB: number[][]) {
  return (
    patternA[0][1] === patternB[2][1] &&
    patternA[1][0] === patternB[1][0] &&
    patternA[1][2] === patternB[1][2] &&
    patternA[2][1] === patternB[0][1]
  )
}
