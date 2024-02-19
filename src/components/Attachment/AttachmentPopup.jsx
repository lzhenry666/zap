import React from 'react'
import './AttachmentPopup.css'
import { useDropzone } from 'react-dropzone';

const AttachmentPopup = ({ onClose, onFileUpload, filePreviews, onUpload }) => {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: onFileUpload,
    });

    return (
        <div className="attachment-popup">
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                <p>Arraste e solte alguns arquivos aqui ou clique para selecionar arquivos</p>
            </div>
            <div className="previews">
                {filePreviews.map((file, index) => (
                    <div key={index} className="preview">
                        <img src={file.preview} alt="Preview" style={{ width: "100px", height: "100px" }} />
                    </div>
                ))}
            </div>
            <button onClick={onClose}>Fechar</button>
            <button onClick={() => onUpload(filePreviews)}>Enviar</button>
        </div>
    );
};

export default AttachmentPopup;