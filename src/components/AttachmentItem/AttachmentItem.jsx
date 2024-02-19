import { useState, useEffect } from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import './AttachmentItem.css';

const AttachmentItem = ({ data, user }) => {
    console.log(`🚀 ~ AttachmentItem ~ data:`, data);
    const [time, setTime] = useState('');

    useEffect(() => {
        if (data.timestamp && data.timestamp.toDate) {
            let d = data.timestamp.toDate(); // Convertendo para objeto Date do JavaScript
            let hours = d.getHours();
            let minutes = d.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            setTime(`${hours}:${minutes}`);
        }
    }, [data]);


    // Função para renderizar o conteúdo do anexo com base no seu tipo
    const renderAttachmentContent = () => {
        if (data.fileType.startsWith('image/')) {
            // Renderiza uma imagem
            return <img src={data.fileUrl} alt={data.fileName} style={{ maxWidth: 250 }} />;
        } else {
            // Renderiza um ícone para outros tipos de arquivos
            return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a href={data.fileUrl} download={data.fileName} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ArticleIcon style={{ fontSize: 50 }} />
                        <span style={{ marginLeft: 10 }}>{data.fileName}</span>
                    </a>
                </div>
            );
        }
    };

    return (
        <div className='messageLine' style={{ justifyContent: user.id === data.userId ? 'flex-end' : 'flex-start' }}>
            <div className='messageItem' style={{ backgroundColor: data.author === user.id ? '#DCF8C6' : '#FFF' }}>
                <div className='messageText'>
                    {renderAttachmentContent()}
                </div>
                <div className='messageDate'>{time}</div>
            </div>
        </div>
    );
};

export default AttachmentItem;
