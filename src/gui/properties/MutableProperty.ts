export class MutableProperty {
  private internalValue: number
  onChange?: (newValue: number) => void

  constructor(initialValue: number) {
    this.internalValue = initialValue
  }

  public get value() {
    return this.internalValue
  }

  public set value(newValue: number) {
    if (newValue !== this.internalValue) {
      this.internalValue = newValue
      if (this.onChange) this.onChange(newValue)
    }
  }

  public static with(newValue: number) {
    return new MutableProperty(newValue)
  }
}
