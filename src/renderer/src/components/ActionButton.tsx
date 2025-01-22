import { ButtonHTMLAttributes, ReactElement } from 'react'

export default function BarButton(props: ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {

    const { className, ...rest } = props
    const buttonClassName = `${className} bg-neutral-200 px-2 py-0.5 rounded text-sm font-medium`

  return (
    <button {...rest} className={buttonClassName}>
      <p>{props.children}</p>
    </button>
  )
}
