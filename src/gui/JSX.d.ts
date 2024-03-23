declare namespace JSX {
  interface GuiElementProps {
    left?: number
    top?: number
    width?: number
    height?: number
    padding?: number
    sizeToFitParent?: "none" | "width" | "height" | "widthAndHeight" // struggling to get enums to work from the jsx types
  }
  interface HLayoutProps extends GuiElementProps {
    horizontalAlignment?: "left" | "middle" | "right" // struggling to get enums to work from the jsx types
  }

  interface ButtonProps extends GuiElementProps {
    onMouseDown?: (button: MouseButton, position: { x: number; y: number }) => void
    onMouseUp?: (button: MouseButton, position: { x: number; y: number }) => void
    onClick?: (button: MouseButton) => void
  }

  interface ImageProps extends GuiElementProps {
    name?: string
  }

  interface ShapeProps extends GuiElementProps {
    fill?: number
    stroke?: number
  }

  interface RectProps extends ShapeProps {}

  interface IntrinsicElements {
    // Define your custom element. Replace `my-element` with your element's tag name
    // and define the props it accepts.
    hlayout: HLayoutProps // Use a more specific type for the props instead of `any` if possible.
    button: ButtonProps
    image: ImageProps
    rect: RectProps
  }
}
