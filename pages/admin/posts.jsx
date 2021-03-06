import React, {useEffect, useState} from 'react'
import axios from 'axios'
import LoginVerification from "../../components/loginVerifiacation"

const Posts = (props) => {

    // Connects to API through axios
    var[postsData, setPostsData] = useState([])
    useEffect(() => {  
        (async function connectToAPI (){
        try {
            await axios.get( props.url + '/api/posts').then((res) => {
            setPostsData(res);
            });
        }
        catch(err) {
            console.error(err)
        }
    
        })()
    }, [])

    // Maps through each blog posts. 
  function GetData () {
    if (postsData.data) return postsData.data.map (data => {
        return (
        <div className="admin-post-container" key={data._id}> 
            <div className="blogpost-container">
                <a href={"blog/"+data._id} className="blogpost-group"> 
                <img alt="Thumbnail" src={`data:image/png;base64, ${data.thumbnailString}` }/> 
                <div className="blogpost-text-group">
                    <h3>{data.title}</h3>
                    <div className="blogpost-info">
                    {data.tags ? data.tags.map(tag => {
                        return <p className="blogposts-tags" key={tag}> {tag} </p>
                    }): <p> </p>}
                    <p className="blogposts-date">{data.FormattedDateOfPost}</p>
                    </div>
                    <h4> {data.summary}</h4>
                </div>
                </a>
            </div>
            <div className="admin-post-buttons">
              <form method="POST" action={ props.url + "/api/post/" + data._id + "/delete"}> <input id="delete" type="submit" value="Delete"/> </form>
              <a id="update" href={"/admin/update/" + data._id}> <input id="update" type="submit" value="Update"/> </a>
            </div> 

          </div>
        )
    })
    return <div className="loading-animation"> 
      <div className="circle1"></div>
      <div className="circle2"></div>
      <div className="circle3"></div>
      <div className="circle4"></div>
    </div>
  }
  

  return (
    <div>
      <LoginVerification url={props.url}>
        <GetData/>
      </LoginVerification>
    </div>
  );
};
export async function getStaticProps() {
  const url = {url: process.env.BACKEND}
  return { props: url };
}

export default Posts