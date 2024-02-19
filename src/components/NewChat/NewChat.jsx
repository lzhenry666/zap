import React, {useState, useEffect, useRef} from 'react';


import './NewChat.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageItem from '../MessageItem/MessageItem';

import Api from '../../Api';

export default ({user, setShow, show, chatlist}) => {

  const [list, setList] = useState([]);

  useEffect(()=>{
    const getList = async () => {
      if ( user !== null ){
        let results = await Api.getContactList(user.id);
        setList(results);
      }
    }
    getList();
  },[user]);

  const addNewChat = async (user2) => {
    await Api.addNewChat(user, user2);

    setShow(false);
  }

  return (
    <div className="newChat" style={{left: show ? 0 : -420 }}>
      <div className="newChat--head">
        <div onClick={()=>setShow(false)} className="newChat--backButton">
          <ArrowBackIcon style={{color: '#fff'}} />
        </div>
        <div className="newChat--headtitle">
          Nova Conversa
        </div>
      </div>
      <div className="newChat--list" >
        {list.map((item, key)=>(
          <div onClick={()=>addNewChat(item)} className="newChat--item" key={key}>
            <img className="newChat--itemavatar" src={item.avatar} alt="" />
            <div className="newChat--itemname" >{item.name}</div>
          </div>

        ))}
      </div>
    </div>
  )
}