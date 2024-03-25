export class MutableProperty<T> {
  private internalValue: T
  private evalFunc?: () => T
  onChange?: (newValue: T) => void

  constructor(initialValue: T, evalFunc?: () => T) {
    this.internalValue = initialValue
    this.evalFunc = evalFunc
  }

  public get value() {
    if (this.evalFunc !== undefined) {
      this.internalValue = this.evalFunc()
    }
    return this.internalValue
  }

  public set value(newValue: T) {
    if (newValue !== this.internalValue && this.evalFunc === undefined) {
      this.internalValue = newValue
      if (this.onChange) this.onChange(newValue)
    }
  }

  public static with<T>(newValue: T) {
    return new MutableProperty(newValue)
  }
}

// make these generic

export function mutablePropertyFromProp(value: MutableProperty<number> | number) {
  if (typeof value === "number") {
    return new MutableProperty(value)
  } else return value
}

export function mutablePropertyFromBoolProp(value: MutableProperty<boolean> | boolean | (() => boolean)) {
  if (typeof value === "boolean") {
    return new MutableProperty(value)
  } else if (typeof value === "function") {
    const func = value as () => boolean
    return new MutableProperty(func(), func)
  } else {
    return value
  }
}
