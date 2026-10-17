import {
  BUTTON_BASE_CLASSES,
  BUTTON_VARIANT,
  BUTTON_VARIANT_CLASSES,
} from 'constants/ui'

const Button = ({
  variant = BUTTON_VARIANT.PRIMARY,
  type = 'button',
  className = '',
  ...props
}) => (
  <button
    type={type}
    className={`${BUTTON_BASE_CLASSES} ${BUTTON_VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  />
)

export default Button
