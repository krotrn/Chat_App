"use client"

import {FcGoogle} from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

const Social = () => {
  return (
    <div className="flex flex-col items-center w-full space-y-2">
      <Button size='lg' className='w-full' variant='outline' onClick={()=> {}} >
        <FcGoogle className='h-5' />
      </Button>
      <Button size='lg' className='w-full' variant='outline' onClick={()=> {}} >
        <FaGithub className='h-5' />
      </Button>
    </div>
  )
}

export default Social