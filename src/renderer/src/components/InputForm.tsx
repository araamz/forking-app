import { InputHTMLAttributes, ReactElement } from 'react'

export default function InputForm(props: InputHTMLAttributes<HTMLInputElement>): ReactElement {
	const { className, ...rest } = props
	const inputClassName = `border border-gray-300 rounded-md p-1 ${className}`
  return <input className={inputClassName} {...rest} />
}