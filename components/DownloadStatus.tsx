import React from 'react'

export const DownloadStatus = ({status, otherStyles}: {status: string; otherStyles?: string}) => {
  return (
    <span className={`status-badge ${otherStyles} ${
      status === 'passed'
        ? 'status-passed'
        : status === 'failed'
        ? 'status-failed'
        : status === 'pending'
        ? 'status-pending'
        : status === 'ongoing'
        ? 'status-ongoing'
        : 'status-pending'
    }`}>{status}</span>
  )
}
