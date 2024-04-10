import { Simulation } from "../model/simulation"
import { DifficultyLevel } from "../model/game"

// In the original game a month lasts around 8 seconds at normal speed and the valves update
// roughly every 2 seconds
export function updateValves(difficultyLevel: DifficultyLevel, simulation: Simulation) {
  const normalisedResidentialPopulation = simulation.population.residential / 8
  const previousTotalPopulation = simulation.population.total
  simulation.population.total =
    normalisedResidentialPopulation + simulation.population.industrial + simulation.population.commercial
  const previousValves = simulation.valveHistory[1]
  const employment =
    normalisedResidentialPopulation > 0
      ? (previousValves.commercial + previousValves.industrial) / normalisedResidentialPopulation
      : 1
  const migration = normalisedResidentialPopulation * (employment - 1)
  const births = normalisedResidentialPopulation * 0.02
  const projectedResidentialPopulation = normalisedResidentialPopulation + migration + births
  const laborBase = Math.max(
    Math.min(
      1.3,
      previousValves.commercial + previousValves.industrial > 0
        ? previousValves.residential / (previousValves.commercial + previousValves.residential)
        : 1,
    ),
    0,
  )
  const internalMarket =
    (normalisedResidentialPopulation + simulation.population.commercial + simulation.population.industrial) / 3.7
  const projectedCommercialPopulation = internalMarket * laborBase
  const difficultyMultiplier =
    difficultyLevel === DifficultyLevel.Easy ? 1.2 : difficultyLevel === DifficultyLevel.Medium ? 1.0 : 0.98
  const projectedIndustrialPopulation = simulation.population.industrial * laborBase * difficultyMultiplier
  let rRatio = Math.min(
    normalisedResidentialPopulation > 0 ? projectedResidentialPopulation / normalisedResidentialPopulation : 1.3,
    2,
  )
  let cRatio = Math.min(
    simulation.population.commercial > 0
      ? projectedCommercialPopulation / simulation.population.commercial
      : projectedCommercialPopulation,
    2,
  )
  let iRatio = Math.min(
    simulation.population.industrial > 0
      ? projectedIndustrialPopulation / simulation.population.industrial
      : projectedIndustrialPopulation,
    2,
  )
  const taxLevel = Math.min(simulation.taxLevel + difficultyLevel, 20)
  rRatio = (rRatio - 1) * 600 + simulation.taxTable[taxLevel]
  cRatio = (cRatio - 1) * 600 + simulation.taxTable[taxLevel]
  iRatio = (iRatio - 1) * 600 + simulation.taxTable[taxLevel]

  if (rRatio > 0) {
    if (simulation.valves.residential < simulation.valveMaximums.residential) {
      simulation.valves.residential += rRatio
    }
  }
  if (rRatio < 0) {
    if (simulation.valves.residential > -simulation.valveMaximums.residential) {
      simulation.valves.residential += rRatio
    }
  }
  if (cRatio > 0) {
    if (simulation.valves.commercial < 1500) {
      simulation.valves.commercial += cRatio
    }
  }
  if (cRatio < 0) {
    if (simulation.valves.commercial > -1500) {
      simulation.valves.commercial += cRatio
    }
  }
  if (iRatio > 0) {
    if (simulation.valves.industrial < 1500) {
      simulation.valves.industrial += iRatio
    }
  }
  if (iRatio < 0) {
    if (simulation.valves.industrial > -1500) {
      simulation.valves.industrial += iRatio
    }
  }
  simulation.valves.residential = Math.max(
    Math.min(simulation.valves.residential, simulation.valveMaximums.residential),
    -simulation.valveMaximums.residential,
  )
  simulation.valves.commercial = Math.max(
    Math.min(simulation.valves.commercial, simulation.valveMaximums.commercial),
    -simulation.valveMaximums.commercial,
  )
  simulation.valves.industrial = Math.max(
    Math.min(simulation.valves.industrial, simulation.valveMaximums.industrial),
    -simulation.valveMaximums.industrial,
  )
  /*
  need to figure out how rescap works but not needed yet
  if ((ResCap) && (RValve > 0)) RValve = 0;	      Stad, Prt, Airprt
  if ((ComCap) && (CValve > 0)) CValve = 0;
  if ((IndCap) && (IValve > 0)) IValve = 0;
  ValveFlag = 1;
   */
}
