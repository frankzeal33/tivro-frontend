import React from 'react'

export const TenentStatus = ({status, otherStyles}: {status: boolean; otherStyles?: string}) => {
  return (
    <span className={`${otherStyles} px-3 py-1 rounded-md ${status ? 'bg-green-500/30' : 'bg-red-500/30'}`}>{status ? "Active" : "Inactive"}</span>
    // <span className={`${otherStyles} px-3 py-1 rounded-md ${status === 'active' ? 'bg-green-500/30' : status === 'evicted' ? 'bg-red-500/30' : status === 'due' ? 'bg-yellow-500/30' : ''}`}>{status}</span>
  )
}
