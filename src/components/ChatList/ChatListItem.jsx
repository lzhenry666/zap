import {useEffect, useState} from 'react'
import './ChatListitem.css'
const ChatListItem = ({ onClick, data,}) => {
  const {chatId,
    title,
    image,
    lastMessage ,
    lastMessageDate,
    active
    } = data;
  const [time, setTime] = useState('');
  useEffect(() => {
    if (lastMessageDate > 0) {
      let d = new Date(lastMessageDate.seconds * 1000);
      let hours = d.getHours();
      let minutes = d.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes}`);
      console.log(`🚀 ~ ChatListItem ~ time:`, time);

    }
  }, [data]);

  return (
    <div className={`chatListItem ${active? 'active':''}`
    }
    onClick={onClick}>
        <img className="chatListItem--avatar" src={image}alt="" />
        <div className="chatListitem--lines">
            <div className="chatListItem--line">
            <div className="chatListItem--name">{title}</div>
            <div className="chatListItem--dat e">{time}</div>
            </div>
            <div className="chatListItem--line">
            <div className="chatListItem--lastMsg">
                <p>{lastMessage}</p>
            </div>
            </div>
        </div>
    </div>
  )
}

export default ChatListItem