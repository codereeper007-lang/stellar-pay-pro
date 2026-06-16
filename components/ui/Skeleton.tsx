import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Card } from './Card'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  circle?: boolean
}

export function Skeleton({
  width,
  height,
  className = '',
  circle = false
}: SkeletonProps) {
  const inlineStyle: React.CSSProperties = {}
  if (width !== undefined) inlineStyle.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) inlineStyle.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={twMerge(
        clsx(
          'skeleton',
          circle ? 'rounded-full' : 'rounded-md',
          !width && 'w-full',
          !height && 'h-4',
          className
        )
      )}
      style={inlineStyle}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({
  lines = 1,
  className = ''
}: SkeletonTextProps) {
  const widths = ['w-full', 'w-11/12', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-1/2']

  return (
    <div className={twMerge(clsx('flex flex-col gap-2', className))}>
      {Array.from({ length: lines }).map((_, index) => {
        // Vary the width of the lines for a more realistic paragraph look
        const widthClass = widths[index % widths.length]
        return (
          <Skeleton
            key={index}
            className={widthClass}
            height={16}
          />
        )
      })}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex flex-col gap-1.5 flex-1">
          <Skeleton className="w-1/3" height={16} />
          <Skeleton className="w-1/4" height={12} />
        </div>
      </div>
      <SkeletonText lines={3} />
    </Card>
  )
}
