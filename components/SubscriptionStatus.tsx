import React from 'react'

export const SubscriptionStatus = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status === 'Active' || status === 'successful' ? 'bg-green-500/30 text-green-700' : status === 'Inactive' || status === 'failed' ? 'bg-red-500/30' : 'bg-gray-500/30'}`}>{status}</span>
  )
}
