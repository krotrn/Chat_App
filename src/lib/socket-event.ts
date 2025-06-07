export const ChatEventEnum = Object.freeze({
  // Connection & Global Presence
  CONNECTED_EVENT: "connected", // Emitted by server to client on successful connection
  DISCONNECT_EVENT: "disconnect", // Standard socket.io event
  USER_ONLINE_EVENT: "userOnline", // Emitted by client when it comes online
  USER_OFFLINE_EVENT: "userOffline", // Emitted by client when it goes offline explicitly
  USER_IS_ONLINE_EVENT: "userIsOnline", // Emitted by server to notify clients that a user is online
  USER_IS_OFFLINE_EVENT: "userIsOffline", // Emitted by server to notify clients that a user is offline
  ONLINE_USERS_LIST_EVENT: "onlineUserIdsList", // Emitted by server to send complete list of online users
  SOCKET_ERROR_EVENT: "socketError", // Emitted by server on socket-related errors

  // Chat Room Specific Events
  JOIN_CHAT_EVENT: "joinChat", // Client requests to join a specific chat room
  LEAVE_CHAT_EVENT: "leaveChat", // Client requests to leave a specific chat room
  // Participant Events (if needed for broadcasting within a chat)
  NEW_PARTICIPANT_ADDED_EVENT: "newParticipantAdded",
  PARTICIPANT_LEFT_EVENT: "participantLeft",

  // Messaging & Interaction Events
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  TYPING_EVENT: "typing",
  STOP_TYPING_EVENT: "stopTyping",
  MESSAGE_DELETE_EVENT: "messageDeleted",
  MESSAGE_PINNED_EVENT: "messagePinned",
  MESSAGE_UNPINNED_EVENT: "messageUnpinned",
  MESSAGE_REACTION_EVENT: "messageReaction",
  MESSAGE_EDITED_EVENT: "messageEdited",
  MESSAGE_READ_EVENT: "messageRead", // If you implement read receipts

  // Chat Meta Events
  NEW_CHAT_EVENT: "newChat", // A new chat is created
  CHAT_DELETED_EVENT: "chatDeleted", // A chat is deleted
  CHAT_UPDATED_EVENT: "chatUpdated", // Chat details (e.g., name, image) updated
  REMOVED_FROM_CHAT: "removedFromChat", // User removed from a chat by another
  UPDATE_GROUP_NAME_EVENT: "updateGroupName", // Specific event for group name change
});
