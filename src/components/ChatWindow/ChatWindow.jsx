import React from 'react'
import Api from '../../Api';
import './ChatWindow.css'
import  MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import InsertEmoctionIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import EmojiPicker from 'emoji-picker-react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useState ,useEffect, useRef,useLayoutEffect} from 'react';
import MessageItem from '../MessageItem/MessageItem';
import AttachmentPopup from '../Attachment/AttachmentPopup';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import 'firebase/storage'; // Importe o módulo de storage se estiver usando o Firebase Storage
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


const ChatWindow = ({user, data}) => {

        let recognition = null;
        let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
             recognition = new SpeechRecognition();
        }

    /*         recognition.onstart = function() {
                console.log("Reconhecimento de voz ativado.");
            };

            recognition.onresult = function(event) {
                var transcript = event.results[0][0].transcript;
                console.log(transcript);
            };

            recognition.start();
        } else {
            console.log("Reconhecimento de voz não suportado neste navegador.");
        } */

    const [emojiOpen, setEmojiOpen] = useState(false);
    const [closeVisible, setCloseVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [listening, setListening] = useState(false);
    const [list, setList] = useState([
    ]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);


    const body = useRef();

    useEffect(()=>{
        if ( body.current.scrollHeight > body.current.offsetHeight){
          body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
          console.log('entrou', body, body.current.scrollHeight, body.current.offsetHeight , 'valor final', body.current.scrollHeight - body.current.offsetHeight, '===', body.current.scrollTop)
        }


      },[list])


    const handleOpenEmoji = () => {
        setEmojiOpen(true);
        setCloseVisible(true);
    }
    const handleCloseEmoji = () => {
        setEmojiOpen(false);
        setCloseVisible(false);
    }
   const handleMicClick = () => {
        console.log('🚀 ~ handleMicClick ~ recognition', recognition);
            recognition.onstart = () => {
                console.log('start');
                setListening(true);

            }
               recognition.onend = () => {
                console.log('end');
                setListening(false);
            }
            recognition.onresult = (e) => {
                setMessage(e.results[0][0].transcript);
                setListening(false);
            }
            recognition.start();


    }
    const handleSendClick = () => {
        if (message !== '') {
            Api.sendMessage(data, user.id, 'text', message, users);
            setMessage('');
            setEmojiOpen(false);
            setCloseVisible(false);

                }        }

    const handleInputKeyUp = (e) => {
        if (e.keyCode === 13) {
            handleSendClick();
        }
    }
    const handleEmojiClick = (e, emojiObject) => {
        console.log(`🚀 ~ handleEmojiClick ~ e:`, e);
        console.log(`🚀 ~ handleEmojiClick ~ emojiObject:`, emojiObject);
        setMessage(message + e.emoji);

            }

            useEffect(() => {
                setList([]);
                let unsub = Api.onChatContent(data.chatId, setList, setUsers);
                return unsub;
            }, [data]);





     const [SearchedwordNewList, setSearchedwordNewList] = useState([]); // Lista original de todas as mensagens

    const [inputVisible, setInputVisible] = useState(false);
    const searchRef = useRef(null);

    const handleSearchClick = () => {
        setInputVisible(!inputVisible);

        // Inicializa SearchedwordNewList com list quando a busca é ativada
        if (!inputVisible) {
            setSearchedwordNewList(list);
        }
    }

    // Função para lidar com a busca

    const handleSearch = (event) => {
        const value = event.target.value;

        // Se for pressionado Enter
        if (event.keyCode === 13) {
            console.log('🚀 ~ HandleSearch ~ value', value);
            let result = list.filter((item) => item.body.toLowerCase().includes(value.toLowerCase()));
            setSearchedwordNewList(result); // Atualiza a lista com os resultados da busca
        }
    };

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setInputVisible(false);
        }
    };

    useEffect(() => {
        if (inputVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Limpeza do ouvinte de eventos
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [inputVisible, SearchedwordNewList]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };
    const [filePreviews, setFilePreviews] = useState([]);

    const handleFileUpload = (files) => {
        // Criar URLs de objeto para os arquivos
        const previews = files.map(file => {
            return Object.assign(file, {
                preview: URL.createObjectURL(file)
            });
        });

        setFilePreviews(previews);
        // Aqui você pode adicionar mais lógica, como preparar os arquivos para upload
    };
    useEffect(() => {
        // Limpar as URLs de objeto quando o componente for desmontado
        return () => {
            filePreviews.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [filePreviews]);

    const uploadFileToFirebaseStorage = async (file) => {
        const storage = getStorage();
        const fileRef = ref(storage, `uploads/${file.name}`);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
      };


    const handleUpload = async (files) => {
        const chatId = data.chatId;
        const userId = user.id;
        for (const file of files) {
            const url = await uploadFileToFirebaseStorage(file); // Supondo que você tenha uma função para fazer o upload
            console.log(`🚀 ~ handleUpload ~ url:`, url);
            await Api.addAttachment(chatId, userId, file, url);
        }

        // Fechar o popup e limpar os previews após o envio
        setIsPopupOpen(false);
        setFilePreviews([]);
    };


    const [Attachments, setAttachments] = useState([
    ]);

    useEffect(() => {
                let unsubscribeMessages = Api.onChatContent(data.chatId, setList, setUsers);
                console.log(`🚀 ~ useEffect ~ unsubscribeMessages:`, unsubscribeMessages);

        const unsubscribeAttachments = Api.onAttachmentsContent(data.chatId, setAttachments);
        console.log(`🚀 ~ useEffect ~ unsubscribeAttachments:`, unsubscribeAttachments);

        return () => {
            unsubscribeMessages();
            unsubscribeAttachments();
              };
    }, [data.chatId]);


    const combinedList = [...list, ...Attachments];

    // Função para obter o timestamp em milissegundos
    const getTimestamp = (item) => {
        // Verifica se o item é uma mensagem ou um anexo e retorna o timestamp correspondente
        if (item.date) {
            return item.date.seconds * 1000 + item.date.nanoseconds / 1000000;
        } else if (item.timestamp) {
            return item.timestamp.seconds * 1000 + item.timestamp.nanoseconds / 1000000;
        }
        return 0; // Retorna 0 se não houver data (isso colocará o item no início da lista)
    };

    // Ordena a lista combinada por data/hora
    combinedList.sort((a, b) => getTimestamp(a) - getTimestamp(b));
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClickMore = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = async () => {
        console.log("Tentando fazer logout");
        try {
            await Api.logout();
            window.location.reload();
            // Lógica adicional após o logout
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };



  return (
    <div className="chatWindow">
        <div className="chatWindow--header">
            <div className="chatWindow--headerinfo">
            <img className="chatWindow--avatar" src={data.image} alt="" />
            <div className="chatWindow--name">{data.title}</div>
            </div>
            <div className="chatWindow--headerbuttons">
            <div className="chatWindow--btn">
                <SearchIcon style={{ color: '#919191' }} onClick={handleSearchClick} />
                {inputVisible &&
                    <input className='InputSearch'
                    ref={searchRef}
                        type="search"
                        placeholder="Procurar na conversa"
                        onKeyUp={handleSearch}
                    />
                }
            </div>
            <div className="chatWindow--btn" onClick={togglePopup}>
                <AttachFileIcon style={{color: '#919191'}}/>
            </div>
            {isPopupOpen && (
                <AttachmentPopup
                    onClose={togglePopup}
                    onFileUpload={handleFileUpload}
                    filePreviews={filePreviews}
                    onUpload={handleUpload}

                />
            )}
            <div className="chatWindow--btn"  onClick={handleClickMore}>
                <MoreVertIcon style={{color: '#919191'}}/>
            </div>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Novo Grupo</MenuItem>
                <MenuItem onClick={handleClose}>Nova Comunidade</MenuItem>
                <MenuItem onClick={handleClose}>Arquivadas</MenuItem>
                <MenuItem onClick={handleClose}>Mensagens Favoritas</MenuItem>
                <MenuItem onClick={handleClose}>Selecionar Conversa</MenuItem>
                <MenuItem onClick={handleClose}>Configurações</MenuItem>
                <MenuItem onClick={handleLogout}>Desconectar</MenuItem>
            </Menu>
            </div>
        </div>
        <div
        ref={body}
        className="chatWindow--body">
              {inputVisible ?
                SearchedwordNewList.map((item, key) => (
                    <MessageItem key={key} data={item} user={user} />
                )) :
                combinedList.map((item, key) => {
                    if (item.type === 'message') {
                        // Renderize o item como uma mensagem
                        return <MessageItem key={key} data={item} user={user} />;
                    } else if (item.type === 'attachment') {
                        // Renderize o item como um anexo
                        return <AttachmentItem key={key} data={item} user={user} />;
                    }
                }
                )
            }

        </div>
    <div className='chatWindow--emojiarea'
    style={{height: emojiOpen ? '200px' : '0px'}}
    >

            <EmojiPicker
            onEmojiClick={handleEmojiClick}
            disableSearchBar
            disableSkinTonePicker />
         </div>

        <div className="chatWindow--footer">
            <div className="chatWindow--pre">
            <div className="chatWindow--btn"
            >
           { closeVisible &&             <CloseIcon style={{color: '#919191'}}
                               onClick={handleCloseEmoji}

                    /> }
                </div>
                <div className="chatWindow--btn"
           onClick={handleOpenEmoji}
           >
                    <InsertEmoctionIcon style={{color: emojiOpen?'#009688':'#919191'}}/>
                </div>
            </div>
            <div className="chatWindow--inputarea">
                <input
                type="text"
                placeholder="Digite uma mensagem"
                 className="chatWindow--input"
                 value={message}
                 onChange={e=>setMessage(e.target.value)}
                 onKeyUp={handleInputKeyUp}
                 />
            </div>
            <div className="chatWindow--pos">
                {message === '' ?
                      <div className="chatWindow--btn">
                      <MicIcon style={{color: listening?'#126ECF' :'#919191'}}
                      onClick={handleMicClick}
                      />

                  </div>:  <div className="chatWindow--btn">
                    <SendIcon style={{color: '#919191'}}
                    onClick={handleSendClick}
                    />

                </div>
                }



            </div>
        </div>
    </div>

    )
}

export default ChatWindow
