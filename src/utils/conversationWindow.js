// Both ends of the chat trim the conversation before it reaches the model: the widget
// trims what it posts, and the endpoint trims again on what arrives. Two copies of the
// rule means the stricter one wins silently, so the rule lives here and both import it.
//
// The opening message is where the visitor says who they are and what they want. A plain
// tail drops it the moment they ask a seventh question, which is exactly the visitor who
// is still here because they are interested - and the one who then gets asked to repeat
// themselves at the point they were about to convert. So the first thing they said holds
// one of the slots and the rest fill from the end. The cap does not move, so this costs
// nothing per request; it only changes which messages the model gets to see.

export const MAX_MESSAGES = 12;

export const trimConversation = (messages) => {
  if (!Array.isArray(messages) || messages.length <= MAX_MESSAGES) return messages ?? [];

  return messages[0].role === 'user'
    ? [messages[0], ...messages.slice(-(MAX_MESSAGES - 1))]
    : messages.slice(-MAX_MESSAGES);
};
