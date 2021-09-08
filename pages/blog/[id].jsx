import React, {useEffect, useState} from 'react'
import Layout from "../../components/layout"
import axios from 'axios'
import Head from 'next/head'

import Page from "../../components/highlighter"
import SinglepostContext from '../../components/context/SinglepostContext'

// Main function. 
const Singlepost = (props) => {

    // Connects to the API and inserts into the react hooks 
    // Take away the spaces at the beginning of a String
    function cleanString(stringToBeCleaned) {
      if(stringToBeCleaned.startsWith(" ")) return stringToBeCleaned.slice(1);
      return stringToBeCleaned;
    }

    // This will sort through the body property in the API and return different html tags depending on the 
    function GetBody() {
        const context = React.useContext(SinglepostContext)
        if (context) {
          return context.body.map(bodyString => {

            if (bodyString.includes("(CODE)")) {
              const splitBodyString = bodyString.split("(CODE)");
              return <Page language={splitBodyString[0]} code={cleanString(splitBodyString[1])}/>
            } 
            else if (bodyString.includes("</Header>")) {
              const header = bodyString.match(new RegExp("<Header>(.*)</Header>"))[1]
              return <h3 className="body-header"> {header}</h3>
            }
            else if (bodyString.includes("</Link>")) {
              const href = bodyString.match(new RegExp("href='(.*)'"))[1]
              const linkText = bodyString.match(new RegExp(">(.*)</Link>"))[1]
              return <a className="body-link" href={href}> {linkText} </a>
            }
            else if (bodyString.includes("/images/")) return <img alt="body" className="body-image" src={bodyString}/>
            else if (bodyString !== "") return <p> {cleanString(bodyString)}</p>
            return null
          })
        }
        return <h2> There was a problem</h2>
    }

    // Get all the attributes of the API and create the post. Also used the GetBody function
    function GetPost() {
      const context = React.useContext(SinglepostContext);
        if (context) {
          return (
              <div className="post-container"> 
                  <div className="post-group">
                    <h1> {context.title}</h1>
                    <h4>{context.summary}</h4>
                    <span className="info-group">
                      {context.tags ? context.tags.map(tag => {
                          // Only return that tag if it's not empty 
                          if (tag !== "") return <p className="title-tags"> {tag}</p>
                          return null
                      }): <p> </p>}
                      <p className="tag-space">|</p>
                      <p className="title-date">{context.FormattedDateOfPost}</p>
                    </span>
                  
                    <div className="body-group">
                      <GetBody/>
                    </div>

                  </div>
              </div>

        )}
        return <div> </div>
    }

    
  return (
    <SinglepostContext.Provider  value={props.content ? props.content : null}>
      <Head>
        <title>My page title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout className="blog-main">
        <GetPost/>
      </Layout>
    </SinglepostContext.Provider>


  )
}

export async function getStaticPaths() {
  const posts = await axios.get('http://localhost:5000/api/posts/')
  const paths = posts.data.map((post) => ({
    params: { id: post._id },
  }))

  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

export async function getStaticProps(post) {
  console.log(post.params.id)

  try {
    const postData = await axios.get(`http://localhost:5000/api/posts/${post.params.id}`)
    const data =  {content:postData.data}
    return { props: data}

  } catch (error) {  
    const data =  {content:false}
    return { props: data}
  }
}

export default Singlepost