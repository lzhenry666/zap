import logo from './logo.svg';
import './App.css';
import  MoreVertIcon from '@mui/icons-material/MoreVert';
import  ChatIcon from '@mui/icons-material/Chat';
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ChatListItem from './components/ChatList/ChatListItem';
import ChatIntro from './components/ChatIntro/ChatIntro';
import NewChat from './components/NewChat/NewChat';
import Login from './components/Login/Login';
import Api from './Api';
import { FacebookAuthProvider } from 'firebase/auth';
function App() {

/*   {
    chatId: 0,
    title: 'Lzhenry666',
    image: '/rias.png',
    lastMessage: 'Olá',
    lastMessageTime: '19:00',
    active: false
  },{
  chatId: 1,
  title: 'Rias Gremory',
  image: '/rias.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 2,
  title: 'Akeno Himejima',
  image: 'akeno.jpg',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 3,
  title: 'Shuuna Tempest',
  image: 'shuuna.png',
  lastMessage: 'Olá,',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 4,
  title: 'Asia Argento',
  image: 'https://www.w3schools.com/w3images/avatar2.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 5,
  title: 'Xenovia Quarta',
  image: 'https://www.w3schools.com/w3images/avatar2.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 6,
  title: 'Rossweisse',
  image: 'https://www.w3schools.com/w3images/avatar2.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 7,
  title: 'Ravel Phenex',
  image: 'https://www.w3schools.com/w3images/avatar2.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
},
{
  chatId: 8,
  title: 'Irina Shidou',
  image: 'https://www.w3schools.com/w3images/avatar2.png',
  lastMessage: 'Olá',
  lastMessageTime: '19:00',
  active: false
} */
  const [chatlist, setChatList] = useState([

  ]);
  const [activeChat, setActiveChat] = useState({});
  const [user, setUser] = useState(
 null
  );
  const [showNewChat, setShowNewChat] = useState(false);

useEffect(() => {
  if (user !== null) {
    let unsub = Api.onChatList(user.id, setChatList);
    return unsub;
  }
}, [user]);

  function handleSelectChat(chatId) {
    // Atualiza o estado 'activeChat'
    const updatedChatList = chatlist.map(chat => {
      return {
        ...chat,
        active: chat.chatId === chatId
      };
    });

    setChatList(updatedChatList);
    setActiveChat(updatedChatList.find(chat => chat.chatId === chatId));
  }

  function handleNewChat() {
    setShowNewChat(true);
  }


  const handleLoginData = async (newUser) => {
    try {
      // Adiciona o usuário ao banco de dados
      await Api.addUser(newUser);

      // Atualiza o estado do usuário no seu aplicativo
      setUser(newUser);
      console.log('Usuário definido', newUser);

    } catch (error) {
      console.error('Erro no login:', error);
    }
  };




  if (user === null) {
    return (
      <Login onReceive={handleLoginData} />
    );
  }
  return (
    <div className="app-window">
      <div className="sidebar">
    <NewChat
        user={user}
        chatlist={chatlist}
        show={showNewChat}
        setShow={setShowNewChat}
    />
    <header>
      <img className="header--avatar" src={user.avatar} alt="" />
    <div className="header--buttons">
      <div className="header--btn">
        <DonutLargeIcon style={{ color: 'red' }} />
      </div>
      <div className="header--btn"
      onClick={handleNewChat}>
        <ChatIcon style={{ color: '#919191' }} />
      </div>
      <div className="header--btn">
        <MoreVertIcon style={{ color: '#919191' }} />
      </div>
    </div>
    </header>

      <section className="search">
      <div className='search--input'>
        <SearchIcon fontSize="small" style={{ color: '#919191' }} />
        <input type="search" placeholder="Procurar ou começar uma nova conversa" />
      </div>


      </section>
      <section className="chatlist">
      {chatlist.map((item, key) => (
  <ChatListItem
    key={key}
    onClick={() => handleSelectChat(item.chatId)}
    data={item}
  />
))}

      </section>

      </div>
      <div className="contentarea">
      {activeChat.active ? <ChatWindow user={user}
      data={activeChat}
      /> : <ChatIntro />}

      </div>
    </div>
  );
}

export default App;
