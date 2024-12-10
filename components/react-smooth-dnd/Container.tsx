import React, { Component, createRef, JSX } from 'react';
import {
  smoothDnD as container,
  type ContainerOptions,
  dropHandlers,
  type SmoothDnD
} from 'smooth-dnd';
import assert from 'assert';

container.dropHandler = dropHandlers.reactDropHandler().handler;
container.wrapChild = false;

interface ContainerProps extends ContainerOptions {
  render?: (rootRef: React.RefObject<any>) => React.ReactElement;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface DragContainerProps {
  behaviour?: 'move' | 'copy' | 'drop-zone' | 'contain';
  groupName?: string;
  orientation?: 'horizontal' | 'vertical';
  style?: object;
  dragHandleSelector?: string;
  nonDragAreaSelector?: string;
  dragBeginDelay?: number;
  animationDuration?: number;
  autoScrollEnabled?: boolean;
  lockAxis?: string;
  dragClass?: string;
  dropClass?: string;
  onDragStart?(...args: unknown[]): unknown;
  onDragEnd?(...args: unknown[]): unknown;
  onDrop?(...args: unknown[]): unknown;
  getChildPayload?(...args: unknown[]): unknown;
  shouldAnimateDrop?(...args: unknown[]): unknown;
  shouldAcceptDrop?(...args: unknown[]): unknown;
  onDragEnter?(...args: unknown[]): unknown;
  onDragLeave?(...args: unknown[]): unknown;
  render?(...args: unknown[]): React.ReactElement;
  getGhostParent?(...args: unknown[]): unknown;
  removeOnDropOut?: boolean;
  dropPlaceholder?:
    | {
        className?: string;
        animationDuration?: number;
        showOnTop?: boolean;
      }
    | boolean;
  children?: React.ReactNode;
}

class DragContainer extends Component<DragContainerProps> {
  static defaultProps = {
    behaviour: 'move',
    orientation: 'vertical'
  };

  prevContainer: null | HTMLElement;
  container: null | SmoothDnD = null;
  containerRef: React.RefObject<any> = createRef();
  constructor(props: ContainerProps) {
    super(props);
    this.getContainerOptions = this.getContainerOptions.bind(this);
    this.getContainer = this.getContainer.bind(this);
    this.isObjectTypePropsChanged = this.isObjectTypePropsChanged.bind(this);
    this.prevContainer = null;
  }

  componentDidMount(): void {
    const c = this.getContainer();
    assert(c !== null, 'Container is null');
    this.prevContainer = c;
    this.container = container(c, this.getContainerOptions());
  }

  componentWillUnmount(): void {
    this.container?.dispose();
    this.container = null;
  }

  componentDidUpdate(prevProps: any): void {
    const c = this.getContainer();
    if (c !== null) {
      // TODO: Check better this if "this.getContainer() !== null"
      if (
        this.prevContainer !== null &&
        this.prevContainer !== this.getContainer()
      ) {
        this.container?.dispose();
        this.container = container(c, this.getContainerOptions());
        this.prevContainer = this.getContainer();
        return;
      }

      const options = this.getContainerOptions();
      if (this.isObjectTypePropsChanged(prevProps) && options !== undefined) {
        this.container?.setOptions(options);
      }
    }
  }

  isObjectTypePropsChanged(prevProps: any): boolean {
    const { render, children, style, ...containerOptions } = this.props;

    for (const _key in containerOptions) {
      const key = _key as keyof ContainerOptions;
      if (containerOptions.hasOwnProperty(key)) {
        // @ts-ignore
        const prop = containerOptions[key];

        if (typeof prop !== 'function' && prop !== prevProps[key]) {
          return true;
        }
      }
    }

    return false;
  }

  render(): JSX.Element {
    if (this.props.render !== undefined) {
      return this.props.render(this.containerRef);
    }
    return (
      <div style={this.props.style} ref={this.containerRef}>
        {this.props.children}
      </div>
    );
  }

  getContainer(): HTMLElement | null {
    return this.containerRef.current as HTMLElement | null;
  }

  getContainerOptions(): ContainerOptions {
    return Object.keys(this.props).reduce((result: any, key: string) => {
      const optionName = key as keyof DragContainerProps;
      const prop = this.props[optionName];

      if (typeof prop === 'function') {
        result[optionName] = (...params: any[]) => {
          return (this.props[optionName] as CallableFunction)(...params);
        };
      } else {
        result[optionName] = prop;
      }

      return result;
    }, {}) as ContainerOptions;
  }
}

export default DragContainer;
