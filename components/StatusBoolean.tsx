import React from 'react'

export const StatusBoolean = ({status, otherStyles}: {status: boolean; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status ? 'bg-green-500/10 text-green-700' :  'bg-red-500/10 text-red-700'}`}>{status ? "Verified" : "Not Verified"}</span>
  )
}