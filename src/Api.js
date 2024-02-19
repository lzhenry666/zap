// Importe as funções necessárias do SDK do Firebase
import { initializeApp } from 'firebase/app';
import {getFirestore, addDoc, arrayUnion, collection, deleteDoc, doc, documentId, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import firebaseConfig from './firebaseconfig';
import { getAuth, signOut, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Inicialize o Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicialize os serviços do Firebase
const db = getFirestore(firebaseApp);
const authentication = getAuth(firebaseApp);
 const Api = {
    fbPopup: async () => {
        try {
          const provider = new FacebookAuthProvider();
          let result = await signInWithPopup(authentication, provider);

          // Verifica se o login foi bem-sucedido
          if (!result.user) {
            throw new Error("Falha no login com o Facebook");
          }

          // Obtém o token de acesso do Facebook
          const accessToken = FacebookAuthProvider.credentialFromResult(result).accessToken;

          // Obtém o UID do usuário do Facebook
          const facebookUid = result.user.providerData[0].uid;

          // Define os parâmetros para a requisição da imagem
          const params = new URLSearchParams({ type: 'large', access_token: accessToken }).toString();

          // Requisição para obter a imagem de perfil como URL
          const avatarUrl = await fetch(`https://graph.facebook.com/${facebookUid}/picture?${params}`)
            .then(response => response.blob())
            .then(blob => URL.createObjectURL(blob));

          // Cria o objeto newUser com os dados do usuário e a URL do avatar
          let newUser = {
            id: result.user.uid,
            name: result.user.displayName,
            avatar: avatarUrl
          };

          console.log(`Usuário do Facebook:`, newUser);
          return newUser;

        } catch (error) {
          console.error("Erro no login do Facebook: ", error);
          throw error;
        }
      },
  glgPopup: async () => {
      try {
          const provider = new GoogleAuthProvider();
          let result = await signInWithPopup(authentication, provider);
          return result;
      } catch (e) {
          console.error("Erro: ", e);
      }
  },
  gthbPopup: async () => {
      try {
          const provider = new GithubAuthProvider();
          let result = await signInWithPopup(authentication, provider);
          return result;
      } catch (e) {
          console.error("Erro: ", e);
      }
  },
  addUser: async (u) => {
    console.log(`🚀 ~ addUser: ~ u:`, u);
    try {
        const userRef = doc(collection(db, 'users'), u.id);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            await updateDoc(userRef, {
                name: u.name,
                avatar: u.avatar
            });
        } else {
            await setDoc(userRef, {
                name: u.name,
                avatar: u.avatar
            });
        }

    } catch (e) {
        console.error("Erro: ", e);
    }
},
  deleteUser: async (u) => {
      try {
          const useRef = doc(collection(db, 'users'), u.id);
          await deleteDoc(useRef);
      } catch (e) {
          console.error("Erro: ", e);
      }
  },
  editUser: async (u) => {
      try {
          const useRef = doc(collection(db, 'users'), u.id);
          await updateDoc(useRef, u)
      } catch (e) {
          console.error("Erro: ", e);
      }
  },
  getUser: () => {

  },
  getContactList: async (userId) => {
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where(documentId(), '!=', userId));

        let list = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            list.push({
                id: doc.id,
                name: doc.data().name,
                avatar: doc.data().avatar
            })
        });

        return list;
    } catch (e) {
        console.error("Erro: ", e);
    }
},
addNewChat: async (user, chatUser) => {
  try {
    // Verificar se o chat já existe
    const userRef = doc(db, 'users', user.id);
    const chatUserRef = doc(db, 'users', chatUser.id);

    const userDoc = await getDoc(userRef);
    const chatUserDoc = await getDoc(chatUserRef);

    const userChats = userDoc.data()?.chats || [];
    const chatUserChats = chatUserDoc.data()?.chats || [];

    const chatExistsForUser = userChats.some(chat => chat.with === chatUser.id);
    const chatExistsForChatUser = chatUserChats.some(chat => chat.with === user.id);

    if (!chatExistsForUser && !chatExistsForChatUser) {
      let newChat = await addDoc(collection(db, 'chats'), {
        message: [],
        users: [user.id, chatUser.id]
      });

      await updateDoc(userRef, {
        chats: arrayUnion({
          chatId: newChat.id,
          title: chatUser.name,
          image: chatUser.avatar,
          with: chatUser.id
        })
      });

      await updateDoc(chatUserRef, {
        chats: arrayUnion({
          chatId: newChat.id,
          title: user.name,
          image: user.avatar,
          with: user.id
        })
      });
    }
  } catch (e) {
    console.error("Erro: ", e);
  }
},


onChatList: (userID, setChatList) => {
  return onSnapshot(doc(db, "users", userID), (doc) => {
      if (doc.exists) {
          let data = doc.data();
          if (data?.chats) {
              let chats = [...data.chats];

              chats.sort((a, b) => {
                  if (a.lastMessageDate === undefined) {
                      return -1;
                  }
                  if (b.lastMessageDate === undefined) {
                      return -1;
                  }

                  if (a.lastMessageDate.seconds < b.lastMessageDate.seconds) {
                      return 1;
                  } else {
                      return -1;
                  }
              });

              setChatList(chats);
          }
      }
  });
},
  onChatContent: (chatId, setList, setUsers) => {
      return onSnapshot(doc(db, "chats", chatId), (doc) => {
          if (doc.exists) {
              let data = doc.data();
              setList(data.message);
              setUsers(data.users);
          }
      });
  },
  sendMessage: async (chatData, userId, type, body, users) => {
      try {
          let now = new Date();

          const chatRef = doc(db, 'chats', chatData.chatId);
          await updateDoc(chatRef, {
              message: arrayUnion({
                  type: 'message',
                  author: userId,
                  body,
                  date: now
              })
          });

          for (let i in users) {
              const docRef = doc(db, "users", users[i]);
              let docSnap = await getDoc(docRef);
              let uData = docSnap.data();

              if (uData.chats) {
                  let chats = [...uData.chats];

                  for (let e in chats) {
                      if (chats[e].chatId === chatData.chatId) {
                          chats[e].lastMessage = body;
                          chats[e].lastMessageDate = now;
                      }
                  }

                  const userRef = doc(db, "users", users[i]);
                  await updateDoc(docRef, {
                      chats
                  });
              }

          }
      } catch (e) {
          console.error("Erro: ", e);
      }
  },
  addAttachment: async (chatId, userId, file, url) => {
    try {
      await addDoc(collection(db, 'Attachments'), {
        chatId: chatId,
        userId: userId,
        fileName: file.name,
        fileType: file.type,
        fileUrl: url,
        timestamp: new Date(),
        type: 'attachment'
      });

      console.log("Anexo adicionado com sucesso.");
    } catch (e) {
      console.error("Erro ao adicionar anexo: ", e);
    }
  },

    onAttachmentsContent: (chatId, setAttachments) => {
        return onSnapshot(query(collection(db, 'Attachments'), where('chatId', '==', chatId)), (querySnapshot) => {
            let attachments = [];
            querySnapshot.forEach((doc) => {
                attachments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setAttachments(attachments);
        });
    },

    deleteAttachment: async (attachmentId) => {
        try {
            await deleteDoc(doc(db, 'Attachments', attachmentId));
        } catch (e) {
            console.error("Erro: ", e);
        }
    },
    logout: async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            console.log("Logout bem-sucedido");
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            throw error; // Certifique-se de relançar o erro para ser capturado no componente
        }
    }


}

export default Api