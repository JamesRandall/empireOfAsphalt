import { createGuiElement } from "../gui/builder"
import { Game, Tool } from "../model/game"
import { GuiElement, HorizontalAlignment, SizeToFit } from "../gui/GuiElement"
import { constants } from "../gui/constants"

export function testGui(state: Game): GuiElement {
  const bs = 48
  const bp = 8

  const colors = {
    build: {
      light: constants.lightGreen,
      dark: constants.darkGreen,
      medium: constants.midGreen,
    },
    power: {
      light: constants.lightOrange,
      dark: constants.darkOrange,
      medium: constants.midOrange,
    },
  }

  const openBuildWindow = (action: () => void) => {
    state.gui.windows.zoning.isVisible.value = false
    state.gui.windows.bulldozer.isVisible.value = false
    state.gui.windows.power.isVisible.value = false
    state.gui.currentTool = Tool.None
    action()
  }

  return (
    <container>
      <hlayout horizontalAlignment="middle" sizeToFitParent={SizeToFit.Width}>
        <button padding={bp} onClick={(b) => console.log(1)} width={bs} height={bs}>
          <image name="pause" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={bp} onClick={(b) => console.log(2)} width={bs} height={bs}>
          <image name="singlespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={bp} width={bs} height={bs}>
          <image name="doublespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <rect width={4} height={bs} fill={0xaa000033} />
        <button
          padding={bp}
          onClick={() =>
            openBuildWindow(() => {
              state.gui.windows.bulldozer.isVisible.value = !state.gui.windows.bulldozer.isVisible.value
              state.gui.currentTool = Tool.ClearTerrain
            })
          }
          width={bs}
          height={bs}
        >
          <image name="bulldozer" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button
          padding={bp}
          onClick={() =>
            openBuildWindow(() => {
              state.gui.windows.zoning.isVisible.value = !state.gui.windows.zoning.isVisible.value
              state.gui.currentTool = Tool.LightResidential
            })
          }
          width={bs}
          height={bs}
        >
          <image name="zones" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button
          padding={bp}
          width={bs}
          height={bs}
          onClick={() => openBuildWindow(() => (state.gui.currentTool = Tool.Road))}
          isSelected={() => state.gui.currentTool === Tool.Road}
        >
          <image name="road" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button
          padding={bp}
          onClick={() =>
            openBuildWindow(() => {
              state.gui.windows.power.isVisible.value = !state.gui.windows.power.isVisible.value
              state.gui.currentTool = Tool.PowerLine
            })
          }
          width={bs}
          height={bs}
        >
          <image name="power" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
      </hlayout>
      <window
        title="Zoning"
        isVisible={state.gui.windows.zoning.isVisible}
        left={state.gui.windows.zoning.left}
        top={state.gui.windows.zoning.top}
        width={bs * 6}
        height={bs + constants.window.titleBarHeight}
        padding={0}
        lightChrome={colors.build.light}
        midChrome={colors.build.medium}
        darkChrome={colors.build.dark}
      >
        <hlayout horizontalAlignment={HorizontalAlignment.Left} sizeToFitParent={SizeToFit.Width}>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.LightResidential)}
            isSelected={() => state.gui.currentTool === Tool.LightResidential}
          >
            <image name="lightResidentialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.DenseResidential)}
            isSelected={() => state.gui.currentTool === Tool.DenseResidential}
          >
            <image name="denseResidentialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.LightCommercial)}
            isSelected={() => state.gui.currentTool === Tool.LightCommercial}
          >
            <image name="lightCommercialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.DenseCommercial)}
            isSelected={() => state.gui.currentTool === Tool.DenseCommercial}
          >
            <image name="denseCommercialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.LightIndustrial)}
            isSelected={() => state.gui.currentTool === Tool.LightIndustrial}
          >
            <image name="lightIndustrialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.DenseIndustrial)}
            isSelected={() => state.gui.currentTool === Tool.DenseIndustrial}
          >
            <image name="denseIndustrialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
        </hlayout>
      </window>

      <window
        title="Terrain"
        isVisible={state.gui.windows.bulldozer.isVisible}
        left={state.gui.windows.bulldozer.left}
        top={state.gui.windows.bulldozer.top}
        width={bs * 4}
        height={bs + constants.window.titleBarHeight}
        padding={0}
        lightChrome={colors.build.light}
        midChrome={colors.build.medium}
        darkChrome={colors.build.dark}
      >
        <hlayout horizontalAlignment={HorizontalAlignment.Left} sizeToFitParent={SizeToFit.Width}>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.ClearTerrain)}
            isSelected={() => state.gui.currentTool === Tool.ClearTerrain}
          >
            <image name="clearTerrain" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.Dezone)}
            isSelected={() => state.gui.currentTool === Tool.Dezone}
          >
            <image name="dezone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.LowerTerrain)}
            isSelected={() => state.gui.currentTool === Tool.LowerTerrain}
          >
            <image name="lowerTerrain" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.build.light}
            midChrome={colors.build.medium}
            darkChrome={colors.build.dark}
            onClick={() => (state.gui.currentTool = Tool.RaiseTerrain)}
            isSelected={() => state.gui.currentTool === Tool.RaiseTerrain}
          >
            <image name="raiseTerrain" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
        </hlayout>
      </window>
      <window
        title="Power"
        isVisible={state.gui.windows.power.isVisible}
        left={state.gui.windows.power.left}
        top={state.gui.windows.power.top}
        width={bs * 5}
        height={bs + constants.window.titleBarHeight}
        padding={0}
        lightChrome={colors.power.light}
        midChrome={colors.power.medium}
        darkChrome={colors.power.dark}
      >
        <hlayout horizontalAlignment={HorizontalAlignment.Left} sizeToFitParent={SizeToFit.Width}>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.power.light}
            midChrome={colors.power.medium}
            darkChrome={colors.power.dark}
            onClick={() => (state.gui.currentTool = Tool.PowerLine)}
            isSelected={() => state.gui.currentTool === Tool.PowerLine}
          >
            <image name="powerLine" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.power.light}
            midChrome={colors.power.medium}
            darkChrome={colors.power.dark}
            onClick={() => (state.gui.currentTool = Tool.CoalPowerPlant)}
            isSelected={() => state.gui.currentTool === Tool.CoalPowerPlant}
          >
            <image name="coalPowerPlant" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.power.light}
            midChrome={colors.power.medium}
            darkChrome={colors.power.dark}
            onClick={() => (state.gui.currentTool = Tool.NuclearPowerPlant)}
            isSelected={() => state.gui.currentTool === Tool.NuclearPowerPlant}
          >
            <image name="nuclearPowerPlant" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.power.light}
            midChrome={colors.power.medium}
            darkChrome={colors.power.dark}
            onClick={() => (state.gui.currentTool = Tool.SolarPowerPlant)}
            isSelected={() => state.gui.currentTool === Tool.SolarPowerPlant}
          >
            <image name="solarPowerPlant" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={colors.power.light}
            midChrome={colors.power.medium}
            darkChrome={colors.power.dark}
            onClick={() => (state.gui.currentTool = Tool.WindTurbine)}
            isSelected={() => state.gui.currentTool === Tool.WindTurbine}
          >
            <image name="windTurbine" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
        </hlayout>
      </window>
    </container>
  )
}
