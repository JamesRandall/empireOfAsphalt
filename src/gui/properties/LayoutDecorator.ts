import "reflect-metadata"
import { MutableProperty } from "./MutableProperty"

// I don't want to build a full blown
export function Layout(): PropertyDecorator {
  return function (target: any, propertyKey: string | Symbol) {
    const pkey = (typeof propertyKey === "string" ? (propertyKey as string) : (propertyKey as Symbol).description)!
    const backingFieldSymbol = `_${pkey}`
    if (!target.hasOwnProperty(backingFieldSymbol)) {
      target[backingFieldSymbol] = target[pkey]
    }

    // Delete the original property
    if (delete target[pkey]) {
      // Create new property with getter and setter
      Object.defineProperty(target, pkey, {
        get: function (): MutableProperty | undefined {
          return this[backingFieldSymbol]
        },
        set: function (newValue: MutableProperty) {
          if (target[backingFieldSymbol] !== undefined) {
            const prop = this[backingFieldSymbol]!
            if (prop.value != newValue.value) {
              prop.value = newValue.value
              this._layoutRequired = true
            }
          } else {
            this[backingFieldSymbol] = newValue
            this._layoutRequired = true
          }
        },
        enumerable: false,
        configurable: true,
      })
    }
  }
}
