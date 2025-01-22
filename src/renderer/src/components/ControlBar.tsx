import { ButtonHTMLAttributes, ReactElement } from 'react'

export default function ControlBar(props: {
  children:
    | ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>
    | Array<ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>>
}): ReactElement {
  return (
    <div className="bg-white p-2 gap-2 drop-shadow flex flex-row items-center">
      {props.children}
    </div>
  )
}
