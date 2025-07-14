import React from 'react'

export const Status = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status === 'passed' ? 'bg-green-500/10 text-green-700' : status === 'failed' ? 'bg-red-500/10 text-red-700' : status === 'pending' ? 'bg-gray-500/10 text-gray-700' : status === 'ongoing' ? 'bg-yellow-500/10 text-yellow-700' : ''}`}>{status}</span>
  )
}
