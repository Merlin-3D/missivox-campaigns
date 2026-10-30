import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/public'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{ title: string; message: string }>

export default function Message({ title, message }: Props) {
  return (
    <div className="public__card">
      <Head title={title} />
      <div className="airmail" />
      <div className="public__body">
        <h1 className="public__title">{title}</h1>
        <p className="public__text">{message}</p>
      </div>
    </div>
  )
}

Message.layout = [PublicLayout]
