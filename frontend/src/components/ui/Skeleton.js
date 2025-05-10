import React from 'react';

const Skeleton = ({ 
  type = 'line',
  width = 'full', 
  height, 
  circle = false, 
  count = 1,
  className = ''
}) => {
  const getWidth = () => {
    if (width === 'full') return 'w-full';
    if (typeof width === 'number') return `w-${width}`;
    return width;
  };
  
  const getHeight = () => {
    if (height === undefined) {
      if (type === 'line') return 'h-4';
      if (type === 'circle') return 'h-12';
      if (type === 'rectangle') return 'h-32';
      if (type === 'avatar') return 'h-10';
      if (type === 'button') return 'h-10';
      if (type === 'text') return 'h-4';
      if (type === 'heading') return 'h-8';
    }
    if (typeof height === 'number') return `h-${height}`;
    return height;
  };
  
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse rounded';
  const shapeClasses = circle ? 'rounded-full' : 'rounded';
  const dimensionClasses = `${getWidth()} ${getHeight()}`;
  
  // Generate skeleton items based on count
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(
      <div 
        key={i} 
        className={`${baseClasses} ${shapeClasses} ${dimensionClasses} ${className} ${i > 0 ? 'mt-2' : ''}`}
      />
    );
  }
  
  return <>{items}</>;
};

// Predefined skeleton components
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        type="text" 
        width={index === lines - 1 && lines > 1 ? '2/3' : 'full'} 
      />
    ))}
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton type="heading" />
    <TextSkeleton lines={2} />
  </div>
);

export const TableRowSkeleton = ({ columns = 4, className = '' }) => (
  <div className={`grid grid-cols-${columns} gap-4 ${className}`}>
    {Array.from({ length: columns }).map((_, index) => (
      <Skeleton key={index} type="text" />
    ))}
  </div>
);

export const AvatarWithTextSkeleton = ({ className = '' }) => (
  <div className={`flex items-center space-x-3 ${className}`}>
    <Skeleton type="avatar" width={10} height={10} circle />
    <div className="space-y-2 flex-1">
      <Skeleton type="text" width="1/3" />
      <Skeleton type="text" width="2/3" />
    </div>
  </div>
);

export default Skeleton;
