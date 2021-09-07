// vendor
import classnames from 'classnames';
import omit from 'lodash/omit';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from "next/link";
const BASE_CLASS = 'c74-button';

const ButtonContainer = styled.div`
.c74-button {
	color: ${props => props.theme.colors.lightText};
	border: none;
	position: relative;
	overflow: hidden;
	padding: 1rem 1.2rem;
	text-align: center;
	display: inline-block;
	font-size: 1rem;
	line-height: 130%;
	cursor: pointer;
	opacity: 1;
	transition: all 300ms;
	font-weight: 400;
	small {
	  display: block;
	  margin-top: 0.5rem;
	  font-size: 0.8rem;
	  letter-spacing: 1px;
	}
	&:hover, &:focus-visible {
	  background: lighten(${props => props.theme.colors.secondary}, 5%);
	}
	&--width-inline {
	  width: auto;
	}
	&--width-full {
	  width: 100%;
	  max-width: 300px;
	}
	&--width-full.c74-anchor {
	  display: block;
	  width: inherit;
	}
	&--width-full.c74-button--arrow-true {
	  position: relative;
	  &:after {
		position: absolute;
		right: 1rem;
	  }
	}

	&--background-light {
	  background: ${props => props.theme.colors.secondary};
	  color: ${props => props.theme.colors.darkText} !important;
	  &:hover {
		background: ${props => props.theme.colors.hilight};;
	  }
	}

	&--background-dark {
	  background: ${props => props.theme.colors.primary};
	  color: ${props => props.theme.colors.lightText} !important;
	  * {
		color: ${props => props.theme.colors.lightText} !important;
	  }
	  &:hover {
		background: ${props => props.theme.colors.hilight};
	  }
	}

	&--size-small {
	  padding: 0.5rem 0.75rem;
	  font-size: 0.8rem;
	  border-radius: 5px;
	}
	&--size-medium {
	  font-size: 1rem;
	}
	&--size-large {
	  font-size: 1.2rem;
	}
	&--size-x-large {
	  padding: 2rem 1rem;
	  font-size: 1.5rem;
	}

	&.c74-anchor {
	  text-decoration: none;
	}

	&--arrow-true {
	  display: inline-box;
	  &:after {
		font-family: 'FontAwesome';
		content: '\f105';
		margin-left: 1rem;
		float: right;
	  }
	}
	&[disabled] {
	  background: ${props => props.theme.colors.lightNeutral};
	  color: ${props => props.theme.colors.darkText};
	}
	@media screen and (max-width: 35.5em) {
	  padding: 0.5rem 0.75rem;
	  &--arrow-true {
		&:after {
		  display: none;
		}
	  }
	}
  }
`;

export default class Button extends React.Component {

  render() {
    const classes = classnames([
      BASE_CLASS,
      this.props.className,
      `${BASE_CLASS}--width-${this.props.width}`,
      `${BASE_CLASS}--size-${this.props.size}`,
      `${BASE_CLASS}--arrow-${this.props.hasArrow}`,
      `${BASE_CLASS}--background-${this.props.background}`
    ]);


    const props = omit(this.props,
      'className',
      'width',
      'background',
      'disabled',
      'hasArrow',
      'type',
      'text',
      'subtext'
    );

    const ComponentType = this.props.to ? Link : 'button';

    let buttonSubtext;
    if (this.props.text) {
      buttonSubtext = this.props.subtext ? <small>{this.props.subtext}</small> : null;
    } else {
      buttonSubtext = this.props.subtext ? <small className="no-top-margin">{this.props.subtext}</small> : null;
    }

	  return (
		  <ButtonContainer>
			  <ComponentType
				  {...props}
				  className={classes}
				  type={this.props.to ? null : this.props.type || 'button'}
				  disabled={this.props.disabled}
			  >
				  {this.props.text ? this.props.text : this.props.children}
				  {buttonSubtext}
			  </ComponentType>
		  </ButtonContainer>
	  );
  }
}

Button.propTypes = {
  width: PropTypes.oneOf(['full', 'inline']),
  background: PropTypes.oneOf(['light', 'dark', 'accent']),
  disabled: PropTypes.bool,
  hasArrow: PropTypes.bool,
  to: PropTypes.string, // incase we wanna render a link instead
  type: PropTypes.oneOf(['button', 'submit']),
  text: PropTypes.string, // set the text of the button here
  // set small text here, for meta info
  subtext: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'x-large'])
};

Button.defaultProps = {
  width: 'inline',
  background: 'dark',
  disabled: false,
  type: 'button',
  size: 'small',
  hasArrow: false
};
