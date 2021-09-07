import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Box from './box'
import Button from './button'
import styled from 'styled-components'

const Wrapper = styled.div`
	.c74-dropdown-select {
	  position: relative;
	  min-width: 10rem;
		background-color: ${props => props.theme.colors.primary};
	  color: ${props => props.theme.colors.lightText};
	}

	select {
		// A reset of styles, including removing the default dropdown arrow
		appearance: none;
		// Additional resets for further consistency
		background-color: transparent;
		border: none;
		padding: 0 1em 0 0;
		margin: 0;
		width: 100%;
		font-family: inherit;
		font-size: inherit;
		cursor: inherit;
		line-height: inherit;
	}
	.c74-dropdown-entry {
		color: #ffffff;
		padding: 8px 16px;
		border: 1px solid transparent;
		border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
		cursor: pointer;
		user-select: none;
	}
`;

const BASE_CLASS = 'c74-dropdown'

export default class SelectDropDownMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dropDownOpen: 'closed',
      hover: 'on'
    }
  }

  render () {
    const classes = [
      this.props.className,
      this.state.dropDownOpen,
      BASE_CLASS
    ]

	  return (
		  <Wrapper>
			  <div className={`${BASE_CLASS}-select`}>
				  <select className={`${BASE_CLASS}-entries`} >
					  {
						  this.props.children.map((entry, i) => {
							  return <option className={`${BASE_CLASS}-entry`} key={i} value={i}>{entry}</option>
						  })
					  }
				  </select>
			  </div>
		  </Wrapper>
	  )
  }
}

SelectDropDownMenu.propTypes = {
  trigger: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}
