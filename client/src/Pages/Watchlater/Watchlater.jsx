import React from 'react'
import vid from "../../Component/Video/vid.mp4"
import WHL from '../../Component/WHL/WHL'
import { useSelector } from 'react-redux'
const Watchlater = () => {
  const watchlatervideolist=useSelector((s)=>s.watchlaterreducer)
    // const watchlatervideolist=[
    //     {
    //       _id:1,
    //       video_src:vid,
    //       chanel:"wvjwenfj3njfwef",
    //       title:"video 1",
    //       uploader:"abc",
    //       description:"description of video 1"
    //     },
    //     {
    //       _id:1,
    //       video_src:vid,
    //       chanel:"wvjwenfj3njfwef",
    //       title:"video 1",
    //       uploader:"abc",
    //       description:"description of video 1"
    //     },
    //     {
    //       _id:2,
    //       video_src:vid,
    //       chanel:"wvjwenfj3njfwef",
    //       title:"video 2",
    //       uploader:"abc",
    //       description:"description of video 2"
    //     },
    //     {
    //       _id:3,
    //       video_src:vid,
    //       chanel:"wvjwenfj3njfwef",
    //       title:"video 3",
    //       uploader:"abc",
    //       description:"description of video 3"
    //     },
    //     {
    //       _id:4,
    //       video_src:vid,
    //       chanel:"wvjwenfj3njfwef",
    //       title:"video 4",
    //       uploader:"abc",
    //       description:"description of video 4"
    //     },
    //   ]
  return (
    <WHL style={{flexWrap: "wrap"}} page={"Watch Later"} videolist={watchlatervideolist}/>
  )
}

export default Watchlater