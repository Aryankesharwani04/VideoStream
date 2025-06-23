import React, { useEffect } from 'react'
import "./Videopage.css"
import moment from 'moment'
import Likewatchlatersavebtns from './Likewatchlatersavebtns'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Comment from '../../Component/Comment/Comment'
// import vidd from "../../Component/Video/vid.mp4"
import { viewvideo } from '../../action/video'
import { addtohistory } from '../../action/history'
import { useSelector,useDispatch } from 'react-redux'
import CustomVideoPlayer from '../../Component/Showvideo/CustomVideoPlayer';
import { useState, useRef } from 'react';

const Videopage = () => {
    const { vid } = useParams();
    const dispatch=useDispatch()
    const vids=useSelector((state)=>state.videoreducer)
    // const vids = [
    //     {
    //         _id: 1,
    //         video_src: vidd,
    //         chanel: "wvjwenfj3njfwef",
    //         title: "video 1",
    //         uploader: "abc",
    //         description: "description of video 1"
    //     },
    //     {
    //         _id: 1,
    //         video_src: vidd,
    //         chanel: "wvjwenfj3njfwef",
    //         title: "video 1",
    //         uploader: "abc",
    //         description: "description of video 1"
    //     },
    //     {
    //         _id: 2,
    //         video_src: vidd,
    //         chanel: "wvjwenfj3njfwef",
    //         title: "video 2",
    //         uploader: "abc",
    //         description: "description of video 2"
    //     },
    //     {
    //         _id: 3,
    //         video_src: vidd,
    //         chanel: "wvjwenfj3njfwef",
    //         title: "video 3",
    //         uploader: "abc",
    //         description: "description of video 3"
    //     },
    //     {
    //         _id: 4,
    //         video_src: vidd,
    //         chanel: "wvjwenfj3njfwef",
    //         title: "video 4",
    //         uploader: "abc",
    //         description: "description of video 4"
    //     },
    // ]
    // console.log( vids)
    const vv = vids?.data.filter((q) => q._id === vid)[0]
   
    const currentuser = useSelector(state => state.currentuserreducer);
    const handleviews=()=>{
        dispatch(viewvideo({id:vid}))
    }
    const handlehistory=()=>{
        dispatch(addtohistory({
            videoid:vid,
            viewer:currentuser?.result._id,
        }))
    }
    useEffect(()=>{
        if(currentuser){
            handlehistory();
        }
        handleviews()
    },[])
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const videoList = vids?.data || [];
    const currentIndex = videoList.findIndex((q) => q._id === vid);
    const handleNextVideo = () => {
        if (currentIndex !== -1 && currentIndex < videoList.length - 1) {
            navigate(`/videopage/${videoList[currentIndex + 1]._id}`);
        }
    };
    const handleShowComments = () => setShowComments(true);
    const handleClose = () => window.close();
    return (
        <>
            <div className='container'>
                <div className="container_videoPage">
                    <div className="container2_videoPage">
                        <div className="video_display_screen_videoPage">
                            <CustomVideoPlayer
                                src={`https://videostream-1b43.onrender.com/${vv?.filepath}`}
                                onNextVideo={handleNextVideo}
                                onShowComments={handleShowComments}
                                onClose={handleClose}
                                className="video_ShowVideo_videoPage"
                                controls={false}
                            />
                            {/* <video src={`http://localhost:5000/${vv?.filepath}`} className="video_ShowVideo_videoPage" controls></video> */}
                        </div>
                        <div className="video_details_videoPage">
                            <div className="video_btns_title_VideoPage_cont">
                                <p className="video_title_VideoPage">{vv?.title}</p>
                                <div className="views_date_btns_VideoPage">
                                    <div className="views_videoPage">
                                        {vv?.views} views <div className="dot"></div>{" "}
                                        {moment(vv?.createdat).fromNow()}
                                    </div>
                                    <Likewatchlatersavebtns vv={vv} vid={vid} />
                                </div>
                            </div>
                            <Link to={'/'} className='chanel_details_videoPage'>
                                <b className="chanel_logo_videoPage">
                                    <p>{vv?.uploader.charAt(0).toUpperCase()}</p>
                                </b>
                                <p className="chanel_name_videoPage">{vv.uploader}</p>
                            </Link>
                            <div style={{ margin: '1rem 0' }}>
                                <details>
                                    <summary style={{fontWeight:'bold', fontSize:'1.1rem'}}>Directions to use</summary>
                                    <ul style={{marginTop:'0.5rem'}}>
                                        <li>Double-tap <b>right</b> side: <i>Forward 10 seconds</i></li>
                                        <li>Double-tap <b>left</b> side: <i>Backward 10 seconds</i></li>
                                        <li>Single-tap <b>middle</b>: <i>Pause/Play</i></li>
                                        <li>Triple-tap <b>middle</b>: <i>Next video</i></li>
                                        <li>Triple-tap <b>right</b>: <i>Close website</i></li>
                                        <li>Triple-tap <b>left</b>: <i>Show comments</i></li>
                                    </ul>
                                </details>
                            </div>
                            <div className="comments_VideoPage" style={{ display: showComments ? 'block' : 'none' }}>
                                <h2>
                                    <u>Comments</u>
                                </h2>
                                <Comment videoid={vv._id}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="moreVideoBar">More videos</div>
            </div>
            
        </>
    )
}

export default Videopage
