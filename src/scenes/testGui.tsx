import { createGuiElement, GuiElement } from "../gui/builder"
import { Game } from "../model/game"
export function testGui(state: Game): GuiElement {
  return (
    <hlayout left={50} top={0}>
      <button padding={8} title="hello" onClick={() => null} width={75} height={75} />
      <button padding={8} title="hello" onClick={() => null} width={75} height={75} />
    </hlayout>
  )
}
