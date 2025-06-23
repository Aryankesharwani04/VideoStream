import React ,{useState}from 'react'
import  './Comment.css'
import moment from 'moment'
import { useSelector,useDispatch } from 'react-redux'
import { editcomment,deletecomment,likeComment,dislikeComment,translateComment } from '../../action/comment'
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'pt', name: 'Portuguese' },
    // Add more as needed
];
const Displaycommment = ({cid,commentbody,userid,commenton,usercommented,city,likes,dislikes}) => {
    const [edit,setedit]=useState(false)
    const[cmtnody,setcommentbdy]=useState("")
    const [cmtid,setcmntid]=useState("")
    const [translated, setTranslated] = useState(null)
    const [translating, setTranslating] = useState(false)
    const [targetLang, setTargetLang] = useState('en')
    const dispatch=useDispatch()
    const currentuser=useSelector(state => state.currentuserreducer);
    const handleedit=(ctid,ctbdy)=>{
        setedit(true)
        setcmntid(ctid)
        setcommentbdy(ctbdy)
    }
    const haneleonsubmit=(e)=>{
        e.preventDefault();
        if(!cmtnody){
            alert("type your comment");
        }else{
            dispatch(editcomment({id:cmtid,commentbody:cmtnody}))
            setcommentbdy("")
        }
        setedit(false)
    }
    const handledel=(id)=>{
        dispatch(deletecomment(id))
    }
    const handleLike = () => {
        dispatch(likeComment(cid))
    }
    const handleDislike = () => {
        dispatch(dislikeComment(cid))
    }
    const handleTranslate = async () => {
        setTranslating(true)
        // Use MyMemory API directly from frontend for demo (not for production)
        const text = commentbody;
        const fromLanguage = 'en'; // Always assume English
        const toLanguage = targetLang;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLanguage}|${toLanguage}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            setTranslated(data.responseData.translatedText);
        } catch (e) {
            setTranslated('Translation error');
        }
        setTranslating(false)
    }

  return (
    <>
    {edit?(
        <>
        <form  className="comments_sub_form_commments" onSubmit={haneleonsubmit}>
            <input type="text" onChange={(e)=>setcommentbdy(e.target.value)} placeholder='Edit comments..' value={cmtnody} className="comment_ibox" />
            <input type="submit" value="change" className="comment_add_btn_comments" />
        </form>
        </>
    ):(
        <>
        <p className="comment_body">{commentbody}</p>
        {translated && <p className="translated_comment">Translated: {translated}</p>}
        </>
    )}
    <p className="usercommented">- {usercommented} ({city || 'Unknown City'}) commented {moment(commenton).fromNow()}</p>
    <div className="comment_actions">
        <button onClick={handleLike}>Like ({likes?.length || 0})</button>
        <button onClick={handleDislike}>Dislike ({dislikes?.length || 0})</button>
        <select value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
        </select>
        <button onClick={handleTranslate} disabled={translating}>{translating ? 'Translating...' : 'Translate'}</button>
    </div>
    {currentuser?.result?._id=== userid && (
        <p className="EditDel_DisplayCommendt">
            <i onClick={()=>handleedit(cid,commentbody)}>Edit</i>
            <i onClick={()=>handledel(cid)}>Delete</i>
        </p>
    )}
    </>
  )
}

export default Displaycommment