import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios.js";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket.js";
import { UserContext } from "../context/userContext.jsx";
import { createRef } from "react";
import Markdown from "markdown-to-jsx";
// import { useRef } from "react";

// function SyntaxHighlightedCode(props) {
//     const ref = useRef(null)

//     React.useEffect(() => {
//         if (ref.current && props.className?.includes('lang-') && window.hljs) {
//             window.hljs.highlightElement(ref.current)

//             // hljs won't reprocess the element unless this attribute is removed
//             ref.current.removeAttribute('data-highlighted')
//         }
//     }, [ props.className, props.children ])

//     return <code {...props} ref={ref} />
// }
// import {hljs} from 'highlight.js';

// function SyntaxHighlightedCode(props) {
//     const ref = useRef(null)

//     React.useEffect(() => {
//         if (ref.current && props.className?.includes('lang-') && window.hljs) {
//             window.hljs.highlightElement(ref.current)

//             // hljs won't reprocess the element unless this attribute is removed
//             ref.current.removeAttribute('data-highlighted')
//         }
//     }, [ props.className, props.children ])

//     return <code {...props} ref={ref} />
// }

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // New state variable for messages
  const messageBox = createRef();
  const [fileTree, setFileTree] = useState({
    "app.js": {
      content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;`,
    },
    "package.json": {
      content: `{
  "name": "temp-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1" 
  },
  "keywords": [],
  "author": "", 
    }`,
    },
  });

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  //  function WriteAiMessage(message) {

  //         const messageObject = JSON.parse(message)

  //         return (
  //             <div
  //                 className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
  //             >
  //                 <Markdown
  //                     children={messageObject.text}
  //                     options={{
  //                         overrides: {
  //                             code: SyntaxHighlightedCode,
  //                         },
  //                     }}
  //                 />
  //             </div>)
  //     }

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage("project-message", (data) => {
      // console.log(data);
      // appendIncomingMessege(data);
      setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
    });
    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
      });
  }, []);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      // console.log(Array.from(newSelectedUserId));
      return newSelectedUserId;
    });

    // setIsModalOpen(false);
  };

  const send = () => {
    // console.log(user);
    sendMessage("project-message", {
      message,
      sender: user,
    });

    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full min-w-110 bg-slate-600  flex flex-col relative">
        <header className="flex justify-between items-center p-4 px-4 w-full bg-slate-400 absolute z-10 top-0">
          <button className="flex gap-2 " onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="flex gap-2"
          >
            <i className="ri-group-fill mr-1"></i>
          </button>
        </header>
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
                } ${
                  msg.sender._id == user._id.toString() && "ml-auto"
                }  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                <p className="text-sm">
                  {msg.sender._id === "ai" ? (
                    <div className="overflow-auto bg-slate-800 text-white ">
                      <Markdown>{msg.message}</Markdown>
                    </div>
                  ) : (
                    msg.message
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 px-4 border-none outline-none flex-grow bg-slate-400"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className=" px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-900 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>

            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="right  bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
              >
                <p className="font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>
        {currentFile && (
        <div className="code-editor flex flex-col flex-grow h-full shrink">

                    <div className="top flex justify-between w-full">

                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                        <p
                                            className='font-semibold text-lg'
                                        >{file}</p>
                                    </button>
                                ))
                            }
                        </div>
          </div>
          <div className="bottom flex-grow flex ">
            {
              fileTree[currentFile] && (
                <textarea value={fileTree[currentFile].content} onChange={(e)=>{
                  setFileTree({...fileTree,[currentFile]:{
                    content:e.target.value
                  }})

                }} className="w-full h-full p-4 bg-slate-50 "></textarea>
              )
            }
          </div>
        </div>
        )}
        
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="bg-slate-200 p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Select Users to Colaborate
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-80 overflow-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-slate-200"
                      : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 bg-slate-600 text-white">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
