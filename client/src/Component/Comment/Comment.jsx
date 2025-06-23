import React, { useState } from 'react'
import "./Comment.css"
import Displaycommment from './DisplayComment'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { postcomment } from '../../action/comment'
const Comment = ({ videoid }) => {
    const dispatch = useDispatch()
    const [commenttext, setcommentext] = useState("")
    const currentuser = useSelector(state => state.currentuserreducer);
    const commentlist = useSelector(state => state.commentreducer)
    // Prevent special characters
    const isValidComment = (text) => {
        return !/[^\w\s.,!?'-]/.test(text)
    }
    const handleonsubmit = (e) => {
        e.preventDefault();
        if (currentuser) {
            if (!commenttext) {
                alert("please type your comment!!")
            }
            else if (!isValidComment(commenttext)) {
                alert("Comment contains invalid special characters!")
            }
            else {
                dispatch(postcomment({
                    videoid: videoid,
                    userid: currentuser?.result._id,
                    commentbody: commenttext,
                    usercommented: currentuser.result.name
                }))
                setcommentext("")
            }
        } else {
            alert("Please login to comment")
        }
    }


    return (
        <>
            <form className='comments_sub_form_comments' onSubmit={handleonsubmit}>
                <input type="text" onChange={(e) => setcommentext(e.target.value)} placeholder='add comment...' value={commenttext} className='comment_ibox' />
                <input type="submit" value="add" className='comment_add_btn_comments' />
            </form>
            <div className="display_comment_container">
                {commentlist?.data.filter((q) => videoid === q?.videoid)
                    .reverse()
                    .map((m) => {
                        return (
                            <Displaycommment
                                cid={m._id}
                                userid={m.userid}
                                commentbody={m.commentbody}
                                commenton={(m.commentedon ? m.commentedon : m.commenton)}
                                usercommented={m.usercommented}
                                city={m.city}
                                likes={m.likes}
                                dislikes={m.dislikes}
                            />
                        )
                    })}
            </div>
        </>
    )
}

export default Comment