import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import logger from "sabio-debug";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import { toast } from "react-toastify";
import * as messagesService from "../../services/messagesService";
import * as profileService from "../../services/profiles/profileService";
import styles from "./messages.module.css";
import PropTypes from "prop-types";

const _logger = logger.extend("chat");

const Chat = (props) => {
  const [connection, setConnection] = useState(null);
  const [chat, setChat] = useState([]);
  const [getUsers, setUserBool] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userConvos, setUserConvos] = useState([]);
  const [selectedConvoId, setSelectedConvo] = useState(null);
  const [userInfo, setUserInfo] = useState([]);
  const latestChat = useRef(null);
  const latestConvo = useRef(null);
  const latestInfo = useRef(null);
  latestChat.current = chat;
  latestConvo.current = userConvos;
  latestInfo.current = userInfo;

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("hub connection string") //proprietary code
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
    if (
      props.location.state !== undefined &&
      props.location.state.type === "USER_ID"
    ) {
      const newUserChat = props.location.state.payload.userId;
      getRecipientInfo(newUserChat);
      getAllConversations();
    } else {
      getAllConversations();
    }
  }, []);
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then((result) => {
          _logger(result, "Connected!");
          connection.on("ReceiveMessage", (message) => {
            const updatedChat = [...latestChat.current];
            updatedChat.push(message);
            setChat(updatedChat);
          });
        })
        .catch((e) => _logger("Connection failed: ", e));
    }
  }, [connection]);

  const sendMessage = async (recipientId, message) => {
    const chatMessage = {
      message: message,
      recipientId: Number(recipientId),
      isActive: true,
    };
    if (connection.connectionStarted) {
      try {
        await connection.send("SendChatMessage", chatMessage);
        _logger("________sending_______");
      } catch (e) {
        _logger(e, "failed to send mmessage");
      }
    } else {
      toast.error("No connection to server yet.");
    }
  };

  function getAllConversations() {
    _logger("getting all chats");
    messagesService
      .getAllUserConversations()
      .then(onGetAllSuccess)
      .catch(onGetAllError);
  }
  function onGetAllSuccess(response) {
    let users = response.data.item;
    let receIds = users.map(mapReceId);
    let sortedUsers = new Set(receIds);
    _logger(sortedUsers);
    let updatedInfo = [...latestInfo.current];
    sortedUsers.forEach((user) => {
      if (user === 33) {
        null;
      } else {
        let userConvo = users.find(function (element) {
          return element.recipientId === user;
        });
        updatedInfo.push(userConvo);
      }
    });
    setUserInfo(updatedInfo);
    let userInfo = updatedInfo.map((item) => item.createdBy[0]);
    let userCards = userInfo.map(renderUserCard);
    const updatedConvo = [...latestConvo.current];
    let newArr = updatedConvo.concat(userCards);
    _logger(newArr);
    setUserConvos(newArr);
    _logger(latestConvo.current);
    setUserBool(true);
  }
  function onGetAllError(response) {
    _logger(response);
    toast.error("Could not retreive previous conversations!");
  }
  function mapReceId(input) {
    let result = input.recipientId;
    return result;
  }
  function getRecipientInfo(recipientId) {
    _logger("adding new chat");
    profileService
      .getByUserId(recipientId)
      .then(onGetUserSuccess)
      .catch(onGetUserError);
  }
  function onGetUserSuccess(response) {
    let currentUser = response.item;
    const userCard = renderUserCard(currentUser);
    const updatedConvo = [...latestConvo.current];
    updatedConvo.push(userCard);
    _logger(updatedConvo);
    setUserConvos(updatedConvo);
    setUserBool(true);
    _logger("new chat added");
  }
  function onGetUserError(response) {
    _logger(response);
    toast.error("A previous chat was not rendered!");
  }
  function renderUserCard(input) {
    return (
      <React.Fragment key={input.userId}>
        <div
          className={`${styles.userChat} card-body bb d-flex`}
          onClick={getChat}
          name={input.firstName}
          id={input.userId}
        >
          <div
            className={`${styles.media} media d-flex align-items-center text-left`}
            style={{ marginLeft: "10px" }}
          >
            <img
              className={`${styles.profilePhoto} rounded-circle`}
              src={input.avatarUrl}
              alt={`${input.firstName} profile photo`}
            />
          </div>
          <div
            className="col-7 d-flex"
            style={{
              marginTop: "14px",
            }}
          >
            <h5>{input.firstName + " " + input.lastName}</h5>
          </div>
          <div className={`${styles.deleteButton} col-12`}>
            <i
              className="icon-trash"
              style={{ float: "right" }}
              onClick={deleteChat}
              id={input.userId}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
  function getPreviousChat(recipientId) {
    setChat([]);
    messagesService
      .getMessages(recipientId)
      .then(onGetMessageSuccess)
      .catch(onGetMessageError);
  }
  function onGetMessageSuccess(response) {
    var prevChat = response.data.item;
    var sortedChat = prevChat.sort((a, b) => a.id - b.id);
    var mappedChat = sortedChat.map(mapChat);
    _logger(mappedChat);
    const updatedChat = [...latestChat.current];
    for (let i = 0; i < mappedChat.length; i++) {
      const prevMsg = mappedChat[i];
      updatedChat.push(prevMsg);
    }
    setChat(updatedChat);
  }
  function onGetMessageError(response) {
    _logger(response, "No previous chat found");
    toast.info("Start a conversation by sending a message");
  }
  function mapChat(input) {
    let result = { senderId: input.senderId, message: input.message };
    return result;
  }
  function getChat(e) {
    let currentTarget = e.currentTarget;
    let user = currentTarget.id;
    let name = currentTarget.textContent;
    getPreviousChat(user);
    setSelectedUser(name);
    setSelectedConvo(user);
  }
  function deleteChat(e) {
    let currentTarget = e.currentTarget;
    let userId = Number(currentTarget.id);
    let data = {
      recipientId: userId,
      isActive: false,
    };
    messagesService
      .updateStatus(data)
      .then(onDeleteSuccess)
      .catch(onDeleteFailure);
    e.stopPropagation();
  }
  function onDeleteSuccess(response) {
    let userId = String(response.recipientId);
    _logger(userId, latestConvo.current);
    const cardToDelete = latestConvo.current.findIndex(
      (element) => element.key === userId
    );
    _logger(cardToDelete);
    const updatedUsers = [...latestConvo.current];
    if (cardToDelete >= 0) {
      updatedUsers.splice(cardToDelete, 1);
    }
    setUserConvos(updatedUsers);
  }
  function onDeleteFailure(response) {
    _logger(response);
    toast.error("Failed to archive conversation");
  }
  return (
    <div className="rag-fadeIn-enter-done">
      <div className={`${styles.chatWrapper} content-wrapper`}>
        <div className="col-12 col-lg-4">
          <div className={`${styles.chatCard} card`}>
            <div className="card-title bb d-flex justify-content-center mb-0">
              <h3
                style={{
                  minHeight: "34px",
                }}
              >
                Chats
              </h3>
            </div>
            <div style={{ overflow: "scroll" }}>
              {getUsers === true && userConvos}
              <button
                className={`${styles.customerSupport} btn btn-outline-primary d-flex justify-content-center`}
                onClick={getChat}
                name={"Customer Support"}
                id={33}
              >
                <div
                  className="d-flex justify-content-center"
                  style={{ flexDirection: "column" }}
                >
                  <h5>Customer Support</h5>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div
          className="card col-12 col-lg-8 "
          style={{ maxHeight: "auto", minHeight: "450px" }}
        >
          <div className="card-title bb d-flex justify-content-center">
            <h3 style={{ minHeight: "34px" }}>{selectedUser}</h3>
          </div>
          <div className={`${styles.chatWindow} card-body`} id="chat-window">
            {selectedConvoId !== null ? (
              <ChatWindow chat={chat} />
            ) : (
              <ChatWindow chat={[]} />
            )}
          </div>
          {selectedConvoId !== null && (
            <ChatInput
              sendMessage={sendMessage}
              recipientId={Number(selectedConvoId)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
Chat.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      type: PropTypes.string,
      payload: PropTypes.shape({
        userId: PropTypes.number,
      }),
    }),
  }),
};

export default Chat;
