import { createGuiElement } from "../gui/builder"
import { Game, Tool } from "../model/game"
import { GuiElement, HorizontalAlignment, SizeToFit } from "../gui/GuiElement"
import { constants } from "../gui/constants"

export function testGui(state: Game): GuiElement {
  const bs = 48
  const bp = 8

  return (
    <container>
      <hlayout horizontalAlignment="middle" sizeToFitParent={SizeToFit.Width}>
        <button padding={bp} onClick={(b) => console.log(1)} width={bs} height={bs}>
          <image name="pause" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={bp} onClick={(b) => console.log(2)} width={bs} height={bs}>
          <image name="singlespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={bp} onClick={() => null} width={bs} height={bs}>
          <image name="doublespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <rect width={4} height={bs} fill={0xaa000033} />
        <button padding={bp} onClick={() => null} width={bs} height={bs}>
          <image name="bulldozer" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button
          padding={bp}
          onClick={() => (state.gui.windows.zoning.isVisible.value = !state.gui.windows.zoning.isVisible.value)}
          width={bs}
          height={bs}
        >
          <image name="zones" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={bp} onClick={() => null} width={bs} height={bs}>
          <image name="road" sizeToFitParent={SizeToFit.WidthAndHeight} />
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
        lightChrome={constants.lightGreen}
        midChrome={constants.midGreen}
        darkChrome={constants.darkGreen}
      >
        <hlayout horizontalAlignment={HorizontalAlignment.Left} sizeToFitParent={SizeToFit.Width}>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.LightResidential)}
            isSelected={() => state.gui.currentTool === Tool.LightResidential}
          >
            <image name="lightResidentialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.DenseResidential)}
            isSelected={() => state.gui.currentTool === Tool.DenseResidential}
          >
            <image name="denseResidentialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.LightCommercial)}
            isSelected={() => state.gui.currentTool === Tool.LightCommercial}
          >
            <image name="lightCommercialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.DenseCommercial)}
            isSelected={() => state.gui.currentTool === Tool.DenseCommercial}
          >
            <image name="denseCommercialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>

          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.LightIndustrial)}
            isSelected={() => state.gui.currentTool === Tool.LightIndustrial}
          >
            <image name="lightIndustrialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={bp}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
            onClick={() => (state.gui.currentTool = Tool.DenseIndustrial)}
            isSelected={() => state.gui.currentTool === Tool.DenseIndustrial}
          >
            <image name="denseIndustrialZone" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
        </hlayout>
      </window>
    </container>
  )
}
