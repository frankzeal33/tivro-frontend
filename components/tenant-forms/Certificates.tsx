import {
  CardContent,
} from "@/components/ui/card"
import FormCardHeader from "./FormCardHeader"

const  Certificates = () => {

return (
  <div className="shadow-none max-w-96">
          <FormCardHeader title="You’ve come to the end" desc="Congratulations, you have completed this verification."/>
          <form className="flex flex-col gap-6">
              <CardContent className="px-4 py-2">
                  <div className="grid gap-6">

                      <div className="mb-4">
                        <div className='w-full flex flex-col bg-muted gap-1 border border-l-primary border-l-6 rounded-md p-2'>
                          <h4 className="text-sm font-semibold">Next steps!</h4>
                          <p className='text-muted-foreground text-xs md:text-sm'>You will receive a mail from us soon.</p>  
                        </div>
                      </div>
                      
                  </div>
              </CardContent>
          </form>
        </div>
)
}

export default Certificates