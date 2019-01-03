/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import Render from 'browser-components/Render'
import CarouselSlidePicker from './CarouselSlidePicker'
import {
  StyledCarousel,
  SlideContainer,
  StyledCarouselLeft,
  StyledCarouselRight,
  StyledCarouselButtonContainer
} from './styled'

export default class Carousel extends Component {
  state = {
    visibleSlide: 0,
    firstRender: true
  }
  constructor (props) {
    super(props)
    this.slides = this.props.slides || []
  }
  shouldComponentUpdate () {
    return this.state.firstRender
  }
  next () {
    this.setState({ visibleSlide: this.state.visibleSlide + 1 })
  }
  prev () {
    this.setState({ visibleSlide: this.state.visibleSlide - 1 })
  }
  getSlide (slideNumber) {
    return this.slides[slideNumber]
  }
  goToSlide (slideNumber) {
    this.setState({ visibleSlide: slideNumber })
  }
  render () {
    return (
      <StyledCarousel data-testid='carousel'>
        <StyledCarouselButtonContainer>
          <Render if={this.state.visibleSlide !== 0}>
            <StyledCarouselLeft>
              <CarouselButton
                data-testid='previousSlide'
                onClick={this.prev.bind(this)}
              >
                <SlidePreviousIcon />
              </CarouselButton>
            </StyledCarouselLeft>
          </Render>
          <Render if={this.state.visibleSlide !== this.slides.length - 1}>
            <StyledCarouselRight>
              <CarouselButton
                data-testid='nextSlide'
                onClick={this.next.bind(this)}
              >
                <SlideNextIcon />
              </CarouselButton>
            </StyledCarouselRight>
          </Render>
        </StyledCarouselButtonContainer>
        <SlideContainer>
          {this.getSlide(this.state.visibleSlide)}
        </SlideContainer>
        <SlideContainer>
          <CarouselSlidePicker
            slides={this.slides}
            visibleSlide={this.state.visibleSlide}
            onClickEvent={slideNumber => this.goToSlide(slideNumber)}
          />
        </SlideContainer>
      </StyledCarousel>
    )
  }
}
