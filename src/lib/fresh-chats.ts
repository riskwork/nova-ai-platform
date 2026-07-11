/**
 * Tiny module-level cache tracking chat IDs that were created locally
 * (via "New Chat" buttons or the send-when-no-chat flow).
 *
 * `chat-view`'s message-loading effect consumes the flag to skip fetching
 * from the server for freshly-created chats — they're empty by definition,
 * and any in-flight streaming messages should not be wiped by a race with
 * `listMessages`.
 */
const freshChats = new Set<string>()

export function markFreshChat(id: string): void {
  freshChats.add(id)
}

export function consumeFreshChat(id: string): boolean {
  return freshChats.delete(id)
}
