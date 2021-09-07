import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Box from './box'
import Button from './button'
import styled from 'styled-components'

const Wrapper = styled.div`
.list-button {
	min-width: 10rem;
}
.c74-dropdown-menu {
	position: relative;
	display: inline-block;
	>.c74-dropdown-menu-trigger {
	  margin: 0;
	  cursor: pointer;
	}

	>.c74-dropdown-menu-entries {
	  display: none;
	  list-style: none;
	  margin: 0;
	  position: absolute;
	  z-index: 100;
	  min-width: 10rem;
	  padding: 0;
	  background-color: ${props => props.theme.colors.primary};
	  color: ${props => props.theme.colors.lightText};
	  border-radius: 5px;
	  > .c74-dropdown-menu-entry {
		margin: 0;
		padding: 0.25rem 0.75rem;
		border-radius: 5px;
		a {
		  @extend .menu-link;
		  box-sizing: border-box;
		  display: block;
		  &:hover {
			background: #000;
		  }
		}
		&:hover {
			background-color: ${props => props.theme.colors.hilight};
		}
	  }
	  &:hover {
		display: block;
	  }
	}

	&--show-entries,
	&.open {
	  > .c74-dropdown-menu-entries {
		display: block;
	  }
	}
	&.closed {
	  > .c74-dropdown-menu-entries {
		display: none;
	  }
	}
  }
`;

const BASE_CLASS = 'c74-dropdown-menu'

export default class DropDownMenu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dropDownOpen: 'closed',
      hover: 'on'
    }
  }

  toggleClick = _ => this.setState({
    hover: 'off',
    dropDownOpen: this.state.dropDownOpen === 'open' && this.state.hover === 'off' ? 'closed' : 'open'
  })

  hoverOn = _ => this.setState({
    dropDownOpen: 'open',
    hover: 'on'
  })

  hoverOff = _ => this.setState({
    dropDownOpen: 'closed',
    hover: 'off'
  })

  render () {
    const classes = [
      this.props.className,
      this.state.dropDownOpen,
      BASE_CLASS
    ]

	  return (
		  <Wrapper>
			  <Box
				  className={classnames(classes)}
				  onMouseEnter={this.hoverOn}
				  onMouseLeave={this.hoverOff}>
				  <Button className={`list-button ${BASE_CLASS}-trigger`} onClick={this.toggleClick} >
					  {this.props.trigger} &#9662;
				  </Button>
				  <ul className={`${BASE_CLASS}-entries`} >
					  {
						  this.props.children.map((entry, i) => {
							  return <li className={`${BASE_CLASS}-entry`} key={i} onClick={this.hoverOff}>{entry}</li>
						  })
					  }
				  </ul>
			  </Box>
		  </Wrapper>
	  )
  }
}

DropDownMenu.propTypes = {
  trigger: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}
