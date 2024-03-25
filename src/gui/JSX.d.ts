// Make sure there are no imports at the top of this

declare namespace JSX {
  type MouseButton = import("./components/InteractiveElement").MouseButton
  type MouseCapture = import("./components/InteractiveElement").MouseCapture
  type MousePositionEvent = import("./components/InteractiveElement").MousePositionEvent
  type MouseDownEvent = import("./components/InteractiveElement").MouseDownEvent
  type MouseUpEvent = import("./components/InteractiveElement").MouseUpEvent

  interface GuiElementProps {
    left?: number | MutableProperty<number>
    top?: number | MutableProperty<number>
    width?: number | MutableProperty<number>
    height?: number | MutableProperty<number>
    padding?: number | MutableProperty<number>
    sizeToFitParent?: SizeToFit
    isVisible?: boolean | MutableProperty<boolean>
  }
  interface HLayoutProps extends GuiElementProps {
    horizontalAlignment?: HorizontalAlignment
  }

  interface ChromeProps {
    lightChrome?: number
    midChrome?: number
    darkChrome?: number
  }

  interface ButtonProps extends GuiElementProps, ChromeProps {
    onMouseDown?: (ev: MouseDownEvent & MouseCapture) => void
    onMouseUp?: (ev: MouseUpEvent & MouseCapture) => void
    onClick?: (button: MouseButton) => void
    isSelected?: boolean | MutableProperty<boolean>
  }

  interface ImageProps extends GuiElementProps {
    name?: string
  }

  interface ShapeProps extends GuiElementProps {
    fill?: number
    stroke?: number
  }

  interface RectProps extends ShapeProps {}

  interface ContainerProps extends GuiElementProps {}

  interface WindowProps extends GuiElementProps, ChromeProps {
    title: string
    onClose?: () => void
  }

  interface IntrinsicElements {
    hlayout: HLayoutProps
    button: ButtonProps
    image: ImageProps
    rect: RectProps
    container: ContainerProps
    window: WindowProps
    raisedbevel: ChromeProps
    bevel: ChromeProps
  }
}
