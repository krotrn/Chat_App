import type { Middleware } from '@reduxjs/toolkit'
import {
	CONNECT_SOCKET,
	DISCONNECT_SOCKET,
	SEND_MESSAGE_SOCKET,
	EMIT_SOCKET_EVENT,
	ConnectSocketPayload,
	SendMessagePayload,
} from '../chatSocketActions'
import {
	setConnectionState,
	addMessage,
	updateMessage,
	removeMessage,
	addChat,
	updateChat,
	removeChat,
	addPinnedMessageId,
	removePinnedMessageId,
} from '../slices/chat-slice'
import { ConnectionState, MessageType, ChatType } from '@/types/ChatType'
import { initSocket, joinChat, getSocket, setSocket, clearSocket } from '@/lib/socket'
import { ChatEventEnum } from '@/lib/socket-event'

export const chatSocketMiddleware: Middleware = store => next => (action: unknown) => {
	if (typeof action === 'object' && action && 'type' in action) {
		switch ((action as unknown as { type: string } & { payload: ConnectSocketPayload } ).type) {
			case CONNECT_SOCKET: {
				const { chatId, token } = (action as unknown as { payload: ConnectSocketPayload }).payload
				const existingSocket = getSocket()
				if (existingSocket) existingSocket.disconnect()
				const socket: SocketIOClient.Socket = initSocket(token)
				setSocket(socket)
				joinChat(chatId)
				store.dispatch(setConnectionState(ConnectionState.CONNECTING))

				socket.on('connect', () => {
					store.dispatch(setConnectionState(ConnectionState.CONNECTED))
				})
				socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, (message: MessageType) => {
					store.dispatch(addMessage(message))
				})
				socket.on(ChatEventEnum.MESSAGE_REACTION_EVENT, (message: MessageType) => {
					store.dispatch(updateMessage(message))
				})
				socket.on(ChatEventEnum.MESSAGE_PINNED_EVENT, (data: { chatId: string, messageId: string }) => {
					store.dispatch(addPinnedMessageId(data.messageId))
				})
				socket.on(ChatEventEnum.MESSAGE_UNPINNED_EVENT, (data: { chatId: string, messageId: string }) => {
					store.dispatch(removePinnedMessageId(data.messageId))
				})
				socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (data: { chatId: string, messageId: string }) => {
					store.dispatch(removeMessage(data.messageId))
				})
				socket.on(ChatEventEnum.MESSAGE_EDITED_EVENT, (message: MessageType) => {
					store.dispatch(updateMessage(message))
				})
				socket.on(ChatEventEnum.NEW_CHAT_EVENT, (chat: ChatType) => {
					store.dispatch(addChat(chat))
				})
				socket.on(ChatEventEnum.CHAT_UPDATED_EVENT, (chat: ChatType) => {
					store.dispatch(updateChat(chat))
				})
				socket.on(ChatEventEnum.CHAT_DELETED_EVENT, (chat: ChatType) => {
					store.dispatch(removeChat(chat._id))
				})
				socket.on(ChatEventEnum.REMOVED_FROM_CHAT, (chat: ChatType) => {
					store.dispatch(removeChat(chat._id))
				})
				socket.on(ChatEventEnum.SOCKET_ERROR_EVENT, () => {
					store.dispatch(setConnectionState(ConnectionState.DISCONNECTED))
				})
				socket.on('disconnect', () => {
					store.dispatch(setConnectionState(ConnectionState.DISCONNECTED))
				})
				break
			}
			case DISCONNECT_SOCKET: {
				clearSocket()
				store.dispatch(setConnectionState(ConnectionState.DISCONNECTED))
				break
			}
			case SEND_MESSAGE_SOCKET: {
				const socket = getSocket()
				if (socket) {
					socket.emit('send_message', (action as unknown as { payload: SendMessagePayload }).payload)
				}
				break
			}
			case EMIT_SOCKET_EVENT: {
				const socket = getSocket()
				if (socket) {
					socket.emit((action as unknown as { event: string, payload: unknown }).event, (action as unknown as { payload: unknown }).payload)
				}
				break
			}
		}
	}
	return next(action)
} 