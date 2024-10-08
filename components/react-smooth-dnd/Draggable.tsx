import React, { Component, cloneElement } from 'react';
import * as PropTypes from 'prop-types';
import { constants } from 'smooth-dnd';
const { wrapperClass } = constants;

export interface DraggableProps {
  render?: () => React.ReactElement;
  className?: string;
  children: JSX.Element;
}

class Draggable extends Component<DraggableProps> {
  public static propsTypes = {
    render: PropTypes.func,
    className: PropTypes.string
  };

  render(): JSX.Element {
    if (this.props.render != null) {
      return cloneElement(this.props.render(), { className: wrapperClass });
    }

    const clsName = `${this.props.className !== undefined ? this.props.className + ' ' : ''}`;
    return (
      <div {...this.props} className={`${clsName}${wrapperClass}`}>
        {this.props.children}
      </div>
    );
  }
}

export default Draggable;
