import { Simulation, zeroRCI } from "../model/simulation"

export function clearCensus(simulation: Simulation) {
  simulation.population = { ...zeroRCI(), total: 0 }
}
