import { ReactElement } from 'react'

export default function Title(props: { label: string }): ReactElement {
  return <h1 className="font-semibold text-lg">{props.label}</h1>
}
