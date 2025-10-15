from langchain_openai import ChatOpenAI
# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
import json
import random  # For sampling examples if needed
from config import Config
from models import ChatData, db  # Import for DB access to update history

# Initialize LLM (fix: use gpt-4o; set your API key in config.py)
llm = ChatOpenAI(model="gpt-4o", temperature=0.7, openai_api_key=Config.OPENAI_API_KEY)

"""llm = ChatGoogleGenerativeAI(
    model="gemini-1.0-pro", 
    temperature=0.7, 
    google_api_key=Config.GOOGLE_API_KEY
)
"""

def create_chatbot_prompt(selected_person, person_msgs):
    """
    Create a high-quality prompt to emulate a person's personality, tone, and style in Roman Urdu.
    person_msgs: list of str (person's messages for examples)
    Limit to 100 examples to avoid token limits; sample if more for diversity.
    """
    # Use up to 100 examples: random sample for better coverage of "whole" style
    # if len(person_msgs) > 500:
    #     person_msgs_sample = random.sample(person_msgs, 500)
    # else:
    #     person_msgs_sample = person_msgs[:500]
    person_msgs_sample=person_msgs[::]
    
    # Format examples as "Person's response: {msg}" for clarity
    examples = "\n".join([f"{selected_person}'s response: {msg}" for msg in person_msgs_sample])

    template = f"""
    You are a chatbot designed to perfectly emulate the personality, tone, humor, and style of {selected_person} 
    based on their chat history written in Roman Urdu.

    Study these examples carefully to capture their unique manner of speaking, casual phrasing, slang, and emotional tone:

    {examples}

    Memory of past conversation: {{history}}

    Instructions for behavior:
    - Always respond in the style of {selected_person} in Roman Urdu.
    - Use casual, friendly, and natural language; include local slang, short forms, and emojis as seen in their messages.
    - Match their vocabulary, sentence structure, humor, and emotional tone.
    - Maintain continuity across messages; remember context from {{history}}.
    - Responses should be concise, engaging, and under 100 words.
    - Never break character, switch to English fully, or reference being a chatbot.

    Human: {{input}}
    {selected_person}:
    """
    # Note: End with "{selected_person}:" to prompt the model to respond in character

    prompt = PromptTemplate(input_variables=["input", "history"], template=template)
    return prompt

def get_chatbot_response(chat_data_id, user_input):
    """
    Generate response using stored chat data.
    Loads example messages (list of str) and persistent history (list of dicts) from DB.
    Updates history in DB after response.
    """
    chat_data = ChatData.query.get(chat_data_id)
    if not chat_data:
        return "Error: Chat data not found."
    
    selected_person = chat_data.selected_person
    if not selected_person:
        return "Error: No person selected for this chat."
    
    # Load person's example messages (JSON string -> list of str)
    try:
        person_msgs = json.loads(chat_data.messages)
    except (json.JSONDecodeError, TypeError):
        person_msgs = []
    
    if not person_msgs:
        return f"Error: No example messages found for {selected_person}. Please upload a valid chat."
    
    # Load persistent conversation history from DB (JSON string -> list of dicts)
    try:
        history = json.loads(chat_data.conversation_history)
    except (json.JSONDecodeError, TypeError):
        history = []
    
    try:
        prompt = create_chatbot_prompt(selected_person, person_msgs)
        
        # Create memory and inject existing history
        memory = ConversationBufferMemory(return_messages=True)
        # Add history messages to memory (role: "human" for user, "ai" for assistant)
        for msg in history:
            if msg.get("role") == "user":
                memory.chat_memory.add_user_message(msg["content"])
            elif msg.get("role") == "assistant":
                memory.chat_memory.add_ai_message(msg["content"])
        
        # Create chain with prompt and memory
        chain = ConversationChain(
            llm=llm, 
            prompt=prompt, 
            memory=memory,
            verbose=False  # Set to True for debugging
        )
        
        # Generate response
        result = chain.invoke({"input": user_input})
        response = result['response']
        
        if not response or response.strip() == "":
            response = f"Sorry, {selected_person} couldn't think of a response right now."
        
        # Append to persistent history in DB (user input + response)
        history.append({"role": "user", "content": user_input})
        history.append({"role": "assistant", "content": response})
        # Keep only last 20 exchanges to prevent bloat (10 user + 10 assistant)
        chat_data.conversation_history = json.dumps(history[-20:])
        db.session.commit()
        
        return response
    
    except Exception as e:
        # Log error for debugging
        print(f"Chatbot error in get_chatbot_response: {e}")
        import traceback
        traceback.print_exc()  # Optional: Full stack trace in console
        return f"Oops! Something went wrong while generating a response: {str(e)}. Please try again."
