import {
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

const FormCardHeader = ({title, desc}: {title: string; desc: string}) => {
  return (
    <CardHeader className="border-b m-4 p-0 pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
    </CardHeader>
  )
}

export default FormCardHeader