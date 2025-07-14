import React from 'react'
import { CardFooter } from '../ui/card'
import { Button } from '../ui/button'

const FormCardFooter = ({text, loading, type="submit", handleClick}: {text: string; loading?: boolean; type?: "submit" | "button"; handleClick?: () => void}) => {
  return (
    <CardFooter className="p-4 border-t">
        <Button loading={loading} disabled={loading} type={type} className="w-full" onClick={handleClick}>
          {loading ? "Loading..." : text}
        </Button>
    </CardFooter>
  )
}

export default FormCardFooter