import json
import random
from config import Config
from models import ChatData, db  
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

# ✅ Lazily initialize the OpenAI Chat Model to avoid startup crashes when API key is missing
_llm = None

def get_llm():
    global _llm
    if _llm is not None:
        return _llm
    api_key = Config.OPENAI_API_KEY
    if not api_key:
        # Delay error until chat usage, return a dummy that raises when used
        raise RuntimeError("OPENAI_API_KEY is not set. Please configure it in environment.")
    _llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        openai_api_key=api_key,
    )
    return _llm

# ✅ Function to create the chatbot's personality prompt
def create_chatbot_prompt(selected_person, person_msgs):
    """
    Create a high-quality prompt to emulate a person's personality, tone, and style in Roman Urdu.
    """
    person_msgs_sample = person_msgs[::]

    examples = "\n".join([
        f"{selected_person}'s response: {msg}"
        for msg in person_msgs_sample
    ])

    # Create structured chat prompt
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are a chatbot designed to perfectly emulate the personality, tone, humor, and style of {selected_person}
based on their chat history written in Roman Urdu.

Study these examples carefully to capture their unique manner of speaking, casual phrasing, slang, and emotional tone:

{examples}

Instructions for behavior:
- Always respond in the style of {selected_person} in Roman Urdu.
- Use casual, friendly, and natural language; include local slang, short forms, and emojis as seen in their messages.
- Match their vocabulary, sentence structure, humor, and emotional tone.
- Maintain continuity across messages; remember context from previous conversation.
- Responses should be concise, engaging, and under 100 words.
- Never break character, switch to English fully, or reference being a chatbot."""
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])
    return prompt


# ✅ Function to get chatbot response
def get_chatbot_response(chat_data_id, user_input):
    """
    Generate response using stored chat data (LangChain 1.0+ compatible).
    """
    chat_data = ChatData.query.get(chat_data_id)
    if not chat_data:
        return "Error: Chat data not found."

    selected_person = chat_data.selected_person
    if not selected_person:
        return "Error: No person selected for this chat."

    # Load person's example messages
    try:
        person_msgs = json.loads(chat_data.messages)
    except (json.JSONDecodeError, TypeError):
        person_msgs = []

    if not person_msgs:
        return f"Error: No example messages found for {selected_person}. Please upload a valid chat."

    # Load conversation history
    try:
        history_data = json.loads(chat_data.conversation_history)
    except (json.JSONDecodeError, TypeError):
        history_data = []

    try:
        prompt = create_chatbot_prompt(selected_person, person_msgs)

        # Initialize message history
        message_history = ChatMessageHistory()

        # Restore previous messages into the chat memory
        for msg in history_data:
            if msg.get("role") == "user":
                message_history.add_message(HumanMessage(content=msg["content"]))
            elif msg.get("role") == "assistant":
                message_history.add_message(AIMessage(content=msg["content"]))

        # Build the runnable pipeline (get model lazily)
        chain = prompt | get_llm()

        # Wrap with message history (persistent conversation memory)
        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: message_history,
            input_messages_key="input",
            history_messages_key="history",
        )

        # Generate model response
        result = chain_with_history.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": str(chat_data_id)}}
        )

        # Extract text safely
        response = getattr(result, "content", str(result))

        if not response.strip():
            response = f"Sorry, {selected_person} couldn’t think of a response right now."

        # Update DB conversation history
        history_data.append({"role": "user", "content": user_input})
        history_data.append({"role": "assistant", "content": response})
        chat_data.conversation_history = json.dumps(history_data[-20:])
        db.session.commit()

        return response

    except Exception as e:
        print(f"Chatbot error in get_chatbot_response: {e}")
        import traceback
        traceback.print_exc()
        return f"Oops! Something went wrong: {str(e)}. Please try again."
