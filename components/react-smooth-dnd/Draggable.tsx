import React from 'react';
import { constants } from 'smooth-dnd';

const { wrapperClass } = constants;

interface DraggableProps {
  render?: () => React.ReactElement;
  className?: string;
  children: React.ReactNode;
  [key: string]: any; // For spreading additional props
}

const Draggable: React.FC<DraggableProps> = ({
  render,
  className,
  children,
  ...rest
}) => {
  if (render) {
    // @ts-ignore
    return React.cloneElement(render(), { className: wrapperClass });
  }

  const combinedClassName = `${className ? className + ' ' : ''}${wrapperClass}`;

  return (
    <div {...rest} className={combinedClassName}>
      {children}
    </div>
  );
};

export default Draggable;
