export const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  DANGER: 'danger',
}

export const BUTTON_BASE_CLASSES =
  'cursor-pointer rounded-md border px-3.5 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60'

export const BUTTON_VARIANT_CLASSES = {
  [BUTTON_VARIANT.PRIMARY]: 'border-primary bg-primary text-primary-text',
  [BUTTON_VARIANT.SECONDARY]: 'border-primary bg-transparent text-primary',
  [BUTTON_VARIANT.GHOST]: 'border-transparent bg-transparent text-primary',
  [BUTTON_VARIANT.DANGER]: 'border-danger bg-transparent text-danger',
}
