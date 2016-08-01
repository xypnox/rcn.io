import React, { PropTypes } from 'react'
import Component from 'react-pure-render/component'
import { addUrlParams } from 'utils/url-utils'
import './Flyer.scss'

export default class Flyer extends Component {
  onLoad(e) {
    e.target.className += ' loaded'
  }

  render() {
    const { url } = this.props
    const googleViewerUrl = addUrlParams('https://docs.google.com/viewer', {
      embedded: true,
      url: url
    })
    const style = {
      width: '100%',
      height: '110rem'
    }

    return (
      <iframe style={style} height='100%' className="Flyer" frameBorder="0"
        src={googleViewerUrl} onLoad={this.onLoad}>
      </iframe>
    )
  }
}

Flyer.propTypes = {
  url: PropTypes.string.isRequired,
}