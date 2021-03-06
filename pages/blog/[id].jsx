import React from 'react'
import Layout from "../../components/layout"
import axios from 'axios'
import Head from 'next/head'

import Page from "../../components/highlighter"

import Footer from '../../components/footer/footer'
import Sidebar from "../../components/navbar/sidebar";
import MobileNavbar from '../../components/navbar/mobileNavbar'

import SidebarContext from "../../components/context/SidebarContext"
import SinglepostContext from '../../components/context/SinglepostContext'

// Main function. 
const Singlepost = (props) => {

    function getKeywords(tags) {
      let tagsString=""
      tags.forEach(tag => {
        tagsString = tagsString + tag + " "
      });

      return tagsString
    }

    // Connects to the API and inserts into the react hooks 
    // Take away the spaces at the beginning of a String

    const processBody = (stringToBeCleaned) => stringToBeCleaned.startsWith(" ") ? 
      stringToBeCleaned.slice(1) :
      stringToBeCleaned
    



    // This will sort through the body property in the API and return different html tags depending on the 
    function GetBody() {
        const context = React.useContext(SinglepostContext)
        let bodyPost;
        if (context) {
          Array.isArray(context.body) ? bodyPost = context.body : bodyPost = context.body.split("\n")
          return bodyPost.map(bodyString => {
            
            // TODO change to switch statement?
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
            else if (bodyString !== "" && bodyString !== "\r" && bodyString !== "\n") {
              return  <p dangerouslySetInnerHTML={{ __html: processBody(bodyString)}}/>
            }
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
    <SinglepostContext.Provider  value={props.content || null}>
      <Head>
        <title>{ props.content ? `${props.content.title} - Infinidream`: "Infinidream"}</title>
        <meta name="description" content={props.content.summary}/>
        <meta name="keywords" content={props.content ? getKeywords(props.content.tags) + "Infinidream" : "infinidream"}/>
        <meta name="robots" content="index, nofollow"/>
        <meta name="language" content="EN"/>

        <meta property="og:type" content="website"/>
        <meta property="og:url" content="http://blog.infinidream.net/"/>
        <meta property="og:title" content={props.content.title ? props.content.title : "Infinidream"}/>
        <meta property="og:description" content={props.content ? props.content.summary : "Infinidream"}/>

        <meta property="twitter:card" content="summary"/>
        <meta property="twitter:url" content="http://blog.infinidream.net/"/>
        <meta property="twitter:title" content={props.content ? props.content.title : "Infinidream"}/>
        <meta property="twitter:description" content={props.content.summary ? props.content.summary : "A blog where I write about programming"}/>
        <meta name="twitter:creator" content="@InfiniDream1" />
        
      </Head>
      <Layout className="blog-main">

        <SidebarContext.Provider  value={props.sidebar || null}>
          <Sidebar/>
          <MobileNavbar/>
        </SidebarContext.Provider>
        <GetPost/>
        
        <Footer />
      </Layout>
    </SinglepostContext.Provider>


  )
}

export async function getStaticPaths() {

  const posts = await axios.get(process.env.BACKEND + '/api/posts/')
  const paths = posts.data.map((post) => ({
    params: { id: post._id },
  }))

  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}



export async function getStaticProps(post) {
  // Get both sidebar and posts. 
  try {

    const postData = await axios.get(process.env.BACKEND + `/api/posts/${post.params.id}`),
    previousPost = await axios.get(process.env.BACKEND + `/api/previous-post/${post.params.id}`),
    fullPost = {
      tags: postData.data.tags,
      _id: postData.data._id,
      title: postData.data.title,
      summary: postData.data.summary,
      body: postData.data.body,
      date_of_post: postData.data.date_of_post,
      url: postData.data.url,
      blogPostUrl: postData.data.blogPostUrl,
      thumbnailString: postData.data.thumbnailString,
      FormattedDateOfPost: postData.data.FormattedDateOfPost,
      id: postData.data.id,
      previousPost: previousPost.data.title ? {
          title: previousPost.data.title,
          url: previousPost.data.url,
          _id: previousPost.data._id
      } : null
    }, // TODO, I'm making this variable to prepare for when I add previous post to the post
    sidebarData = await axios.get(process.env.BACKEND + '/api/recent-posts'),
    data =  {content:fullPost, sidebar:sidebarData.data}
    return { props: data}

  } catch (error) {  
    const data =  {content:false}
    return { props: data}
  }
}

export default Singlepost
