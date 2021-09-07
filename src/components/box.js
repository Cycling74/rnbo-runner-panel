import omit from 'lodash/omit';
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const BASE_CLASS = 'c74-box';

/**
 * Simple Box Container that helps applying consistent paddings,
 * margins etc etc via props.
 */
export default class Box extends React.Component {

  render() {

    const classes = [
      this.props.className,
      BASE_CLASS, {
        [`${BASE_CLASS}--padding-${this.props.padding}`]: this.props.padding !== 'none',
        [`${BASE_CLASS}--text-${this.props.textAlign}`]: !!this.props.textAlign
      }
    ];

    const props = omit(this.props,
      'className',
      'padding',
      'tagName',
      'textAlign'
    );

    return (
      <this.props.tagName { ...props } className={ classnames(classes) } >
        { this.props.children }
      </this.props.tagName>
    );
  }
}

Box.propTypes = {
  padding: PropTypes.oneOf(['top', 'bottom', 'vertical', 'horizontal', 'left', 'right', 'all', 'none']),
  tagName: PropTypes.string,
  textAlign: PropTypes.oneOf(['left', 'center', 'right'])
};

Box.defaultProps = {
  padding: 'none',
  tagName: 'div'
};
