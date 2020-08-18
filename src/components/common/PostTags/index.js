import React from 'react'
import { createUseStyles } from 'react-jss'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'

const useStyle = createUseStyles({
  tags: {
    wordWrap: 'break-word',
    width: 'calc(100% - 60px)',
    height: 'max-content',
    fontSize: 14,
    fontFamily: 'Segoe-Bold',
  },
  default: {
    marginRight: 5,
    color: '#d32f2f !important',
  },
  highlighted: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingLeft: 2,
    paddingRight: 2,
    paddingBottom: 2,
    color: 'white !important',
  },
})

const PostTags = (props) => {
  const classes = useStyle()
  const { meta, highlightTag, user } = props
  const { is_authenticated } = user
  const history = useHistory()

  let tags = []
  try {
    if('tags' in meta) {
      tags = meta.tags
    }
  } catch (e) {  }

  const generateTagsLink = (tag) => {
    let link = ''

    if(!is_authenticated) {
      link = '/ug'
    }

    link += `/tags?q=${tag}`

    return link
  }

  const prevent = (e) => {
    e.preventDefault()
  }

  const onClick = (link) => (e) => {
    e.stopPropagation()
    e.preventDefault()
    history.push(link)
  }

  return (
    <div className={classes.tags} onClick={prevent}>
      {tags.map((tag, index) => (
        <Link
          onClick={onClick(generateTagsLink(tag))}
          key={`${tag}~${index}~${Math.random(0,100)}`}
          className={classNames(classes.default, `${highlightTag}`.toLowerCase() === `${tag}`.toLowerCase() ? classes.highlighted : '')}
        >
          #{tag}
        </Link>
      ))}
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.auth.get('user'),
})

export default connect(mapStateToProps)(PostTags)
