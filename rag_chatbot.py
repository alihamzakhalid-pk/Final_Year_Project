"""
RAG (Retrieval-Augmented Generation) Chatbot Module
Handles vector embeddings, storage, and retrieval for enhanced chatbot responses
"""

import json
import os
import random
from datetime import datetime
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from config import Config
from models import ChatData, db

# Import mood configuration
from mood_config import build_mood_aware_prompt

# Directory for storing vector databases
CHROMA_DB_DIR = "./chroma_db"

# Ensure directory exists
os.makedirs(CHROMA_DB_DIR, exist_ok=True)


def get_embeddings(api_key=None):
    """Get OpenAI embeddings model
    
    Args:
        api_key: Optional user-provided OpenAI API key. If not provided, uses Config.OPENAI_API_KEY
    """
    api_key = api_key or Config.OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set and user did not provide one")
    
    # Use smaller, cheaper embedding model
    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=api_key
    )


def get_llm(api_key=None, mood="natural"):
    """Get OpenAI LLM with mood-based temperature
    
    Args:
        api_key: Optional user-provided OpenAI API key. If not provided, uses Config.OPENAI_API_KEY
        mood: Current mood to adjust temperature
        
    Returns:
        ChatOpenAI instance with mood-appropriate temperature
    """
    api_key = api_key or Config.OPENAI_API_KEY
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set and user did not provide one")
    
    # Mood-based temperature settings
    mood_temperatures = {
        "happy": 0.9,    # More creative and enthusiastic
        "natural": 0.7,  # Balanced
        "sad": 0.5       # More controlled and empathetic
    }
    
    temperature = mood_temperatures.get(mood, 0.7)  # Default to 0.7 if mood not found
    
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temperature,
        openai_api_key=api_key,
        timeout=60.0,  # Increased from default 10s to 60s
        max_retries=3  # Retry up to 3 times on failure
    )


def create_vector_store(chat_data, api_key=None):
    """
    Create vector store from chat messages.
    This is called once when a persona is created.
    
    Args:
        chat_data: ChatData object with messages
        
    Returns:
        Chroma vector store instance
    """
    try:
        print(f"\n[RAG] Creating vector store for chat {chat_data.id}")
        print(f"[RAG] Selected person: {chat_data.selected_person}")
        
        # Load ALL messages (not limited to 300)
        messages_json = chat_data.messages
        if isinstance(messages_json, str):
            all_messages = json.loads(messages_json)
        else:
            all_messages = messages_json
        
        print(f"[RAG] Processing {len(all_messages)} messages")
        
        # Convert messages to LangChain Document objects
        documents = []
        for i, msg in enumerate(all_messages):
            # Handle both string and dict message formats
            if isinstance(msg, dict):
                content = msg.get('message', msg.get('content', str(msg)))
            else:
                content = str(msg)
            
            # Skip empty messages
            if not content.strip():
                continue
            
            doc = Document(
                page_content=content,
                metadata={
                    "person": chat_data.selected_person,
                    "chat_id": chat_data.id,
                    "message_index": i
                }
            )
            documents.append(doc)
        
        print(f"[RAG] Created {len(documents)} documents")
        
        # Check if we have any documents to embed
        if not documents:
            raise ValueError(f"No valid messages found for {chat_data.selected_person}. All messages were empty.")
        
        # Create embeddings
        embeddings = get_embeddings(api_key)
        
        # Create persist directory for this chat
        persist_dir = os.path.join(CHROMA_DB_DIR, f"chat_{chat_data.id}")
        
        # Create vector store
        vector_store = Chroma.from_documents(
            documents=documents,
            embedding=embeddings,
            persist_directory=persist_dir,
            collection_name=f"chat_{chat_data.id}"
        )
        
        print(f"[RAG] ✅ Vector store created successfully at {persist_dir}")
        print(f"[RAG] Stored {vector_store._collection.count()} embeddings\n")
        
        return vector_store
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to create vector store: {e}")
        import traceback
        traceback.print_exc()
        raise


def load_vector_store(chat_data_id, api_key=None):
    """
    Load existing vector store for a chat.
    
    Args:
        chat_data_id: ID of the chat
        
    Returns:
        Chroma vector store instance or None if not exists
    """
    try:
        persist_dir = os.path.join(CHROMA_DB_DIR, f"chat_{chat_data_id}")
        
        # Check if vector store exists
        if not os.path.exists(persist_dir):
            print(f"[RAG] Vector store not found for chat {chat_data_id}")
            return None
        
        embeddings = get_embeddings(api_key)
        
        vector_store = Chroma(
            persist_directory=persist_dir,
            embedding_function=embeddings,
            collection_name=f"chat_{chat_data_id}"
        )
        
        print(f"[RAG] Loaded vector store for chat {chat_data_id}")
        print(f"[RAG] Contains {vector_store._collection.count()} embeddings")
        
        return vector_store
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to load vector store: {e}")
        return None


def retrieve_relevant_messages(vector_store, query, k=10):
    """
    Retrieve relevant messages based on semantic similarity.
    
    Args:
        vector_store: Chroma vector store
        query: User's message/query
        k: Number of relevant messages to retrieve
        
    Returns:
        List of relevant message strings
    """
    try:
        print(f"[RAG] Retrieving top {k} relevant messages for query: '{query[:50]}...'")
        
        # Perform semantic search
        relevant_docs = vector_store.similarity_search(query, k=k)
        
        # Extract message content
        relevant_messages = [doc.page_content for doc in relevant_docs]
        
        print(f"[RAG] Retrieved {len(relevant_messages)} relevant messages")
        
        return relevant_messages
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to retrieve messages: {e}")
        return []


def get_personality_messages(chat_data, num_messages=40):
    """
    Get a diverse sample of messages for personality/style reference.
    Uses stable seeding for consistent personality across requests.
    
    Args:
        chat_data: ChatData object with messages
        num_messages: Number of messages to sample (default 40 for faster performance)
        
    Returns:
        List of message content strings
    """
    try:
        messages_json = chat_data.messages
        if isinstance(messages_json, str):
            all_messages = json.loads(messages_json)
        else:
            all_messages = messages_json
        
        # Extract message content (handle both dict and string formats)
        valid_messages = []
        for msg in all_messages:
            if isinstance(msg, dict):
                content = msg.get('message', msg.get('content', str(msg)))
            else:
                content = str(msg)
            
            # Skip empty messages
            if content.strip():
                valid_messages.append(content)
        
        # If we have fewer messages than requested, use all available
        if len(valid_messages) <= num_messages:
            print(f"[RAG] Using all {len(valid_messages)} available messages for personality reference")
            return valid_messages
        
        # STABLE SEEDING: Use chat_data.id as seed for consistent personality
        random.seed(chat_data.id)
        sampled_messages = random.sample(valid_messages, num_messages)
        print(f"[RAG] Sampled {len(sampled_messages)} messages from {len(valid_messages)} total for personality reference")
        
        return sampled_messages
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to get personality messages: {e}")
        return []


def create_rag_prompt(selected_person, personality_messages, contextual_messages, using_fallback=False, mood="natural"):
    """
    Create enhanced prompt with both personality reference and contextual examples.
    
    Args:
        selected_person: Name of the person to emulate
        personality_messages: List of messages for personality/style reference (large set)
        contextual_messages: List of contextually relevant messages (small set, RAG retrieved)
        using_fallback: Whether contextual messages are from fallback (not semantically retrieved)
        mood: Current mood setting ('natural', 'happy', 'sad')
        
    Returns:
        ChatPromptTemplate
    """
    # Format personality messages
    num_personality = len(personality_messages)
    personality_context = "\n".join([
        f"{selected_person}: {msg}"
        for msg in personality_messages
    ])
    
    # Format contextual messages
    num_contextual = len(contextual_messages)
    contextual_context = "\n".join([
        f"{selected_person}: {msg}"
        for msg in contextual_messages
    ])
    
    # Contextual section intro
    if using_fallback:
        contextual_intro = f"""📚 ADDITIONAL EXAMPLE MESSAGES ({num_contextual} messages):
These are additional examples from {selected_person}'s chat history."""
    else:
        contextual_intro = f"""🎯 TOPIC-SPECIFIC CONTEXTUAL EXAMPLES ({num_contextual} messages):
These messages show how {selected_person} discussed similar topics or situations. 
They were selected because they relate to the current user's question. 
USE THESE TO UNDERSTAND THE TOPIC AND CONTEXT, but always match the communication 
style from the personality reference above."""
    
    # Create base system prompt
    base_system_prompt = f"""You are a chatbot designed to perfectly emulate the personality, tone, humor, and style of {selected_person}
based on their chat history written in Roman Urdu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 CORE PERSONALITY & STYLE REFERENCE ({num_personality} messages)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These messages define {selected_person}'s fundamental communication style, vocabulary patterns, 
sentence structures, humor style, emotional expressions, and overall personality.

USE THESE AS YOUR PRIMARY REFERENCE for how {selected_person} communicates.

{personality_context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{contextual_intro}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{contextual_context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: Your response must:
1. Match {selected_person}'s STYLE from the {num_personality} personality messages above (PRIMARY REFERENCE)
2. Use the {num_contextual} contextual messages to understand what {selected_person} has said about similar topics
3. Respond as {selected_person} would, combining their core personality style with topic-appropriate content

Even if the contextual messages have a different tone or style, ALWAYS prioritize matching the 
personality patterns from the personality reference. The contextual messages are for topic 
understanding, NOT style definition.

Additional instructions:
- Use casual Roman Urdu with slang, short forms, and emojis as seen in the personality examples
- Match their vocabulary, sentence structure, humor, and emotional tone
- Keep responses concise (under 100 words)
- NEVER break character or mention being a chatbot"""

    # Apply mood modifications to the base prompt
    mood_aware_system_prompt = build_mood_aware_prompt(base_system_prompt, mood)
    
    # Add explicit mood instruction header for stronger tone control
    mood_header = f"CURRENT MOOD: {mood.upper()}"
    mood_aware_system_prompt = f"{mood_header}\n\n{mood_aware_system_prompt}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", mood_aware_system_prompt),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}")
    ])
    
    return prompt


def get_chatbot_response_rag(chat_data_id, user_input, user_api_key=None, mood="natural"):
    """
    Generate chatbot response using RAG (Retrieval-Augmented Generation) with mood awareness.
    
    This function:
    1. Loads the vector store for the chat
    2. Retrieves relevant messages based on user input
    3. Creates an enhanced prompt with relevant context and mood instructions
    4. Generates a response using GPT-4 with mood-based temperature
    5. Saves conversation history and updates mood tracking
    
    Args:
        chat_data_id: ID of the ChatData entry
        user_input: User's message
        user_api_key: Optional user-provided OpenAI API key from session
        mood: Current mood for response generation
        
    Returns:
        str: Chatbot response
    """
    try:
        print(f"\n[RAG] ===== Processing message for chat {chat_data_id} in mood '{mood}' =====")
        
        # Load chat data using modern SQLAlchemy query
        chat_data = db.session.query(ChatData).filter(ChatData.id == chat_data_id).first()
        if not chat_data:
            return "Error: Chat data not found."
        
        selected_person = chat_data.selected_person
        if not selected_person:
            return "Error: No person selected for this chat."
        
        # MOOD HISTORY TRACKING: Update mood history if mood changed
        if chat_data.current_mood != mood:
            mood_history = chat_data.mood_history or []
            if isinstance(mood_history, str):
                mood_history = json.loads(mood_history)
            
            # Add new mood entry with timestamp
            mood_entry = {
                "mood": mood,
                "timestamp": datetime.now().isoformat(),
                "changed_from": chat_data.current_mood
            }
            mood_history.append(mood_entry)
            
            # Keep only last 10 mood changes
            if len(mood_history) > 10:
                mood_history = mood_history[-10:]
            
            # Update database
            chat_data.current_mood = mood
            chat_data.mood_selected_at = datetime.now()
            chat_data.mood_history = json.dumps(mood_history)
            db.session.commit()
            
            print(f"[RAG] Mood changed from {mood_entry['changed_from']} to {mood} for chat {chat_data_id}")
        
        print(f"[RAG] User input: '{user_input}'")
        print(f"[RAG] Selected person: {selected_person}")
        
        # Load or create vector store
        vector_store = load_vector_store(chat_data_id, user_api_key)
        if not vector_store:
            print("[RAG] Vector store not found, creating new one...")
            vector_store = create_vector_store(chat_data, user_api_key)
        
        # Get personality messages (reduced to 40 for better performance, with stable seeding)
        personality_messages = get_personality_messages(chat_data, num_messages=40)
        
        if not personality_messages:
            return f"Error: No messages available for {selected_person}. Please ensure chat data is properly uploaded."
        
        # Retrieve contextually relevant messages (small set for topic context)
        contextual_messages = retrieve_relevant_messages(vector_store, user_input, k=10)
        
        using_fallback = False
        if not contextual_messages:
            print("[RAG] Warning: No relevant messages retrieved, using fallback for contextual examples")
            using_fallback = True
            # Fallback: use some random messages (avoid duplicates with personality set)
            try:
                messages_json = chat_data.messages
                if isinstance(messages_json, str):
                    all_messages = json.loads(messages_json)
                else:
                    all_messages = messages_json
                
                # Extract message content (handle both dict and string formats)
                all_valid_messages = []
                for msg in all_messages:
                    if isinstance(msg, dict):
                        content = msg.get('message', msg.get('content', str(msg)))
                    else:
                        content = str(msg)
                    
                    if content.strip():  # Skip empty messages
                        all_valid_messages.append(content)
                
                # Get contextual messages (try to avoid duplicates with personality set)
                personality_set = set(personality_messages)
                contextual_candidates = [msg for msg in all_valid_messages if msg not in personality_set]
                
                # If we have enough non-duplicate messages, use them; otherwise use any available
                if len(contextual_candidates) >= 10:
                    contextual_messages = contextual_candidates[:10]
                elif len(contextual_candidates) > 0:
                    contextual_messages = contextual_candidates
                else:
                    # Last resort: use from all messages (may have duplicates, but that's okay)
                    contextual_messages = all_valid_messages[:10] if len(all_valid_messages) >= 10 else all_valid_messages
                    
            except (json.JSONDecodeError, TypeError, AttributeError) as e:
                print(f"[RAG] Fallback error: {e}")
                contextual_messages = []
        
        # Load conversation history (keep last 20 entries = 10 turns)
        try:
            history_data = json.loads(chat_data.conversation_history or '[]')
        except (json.JSONDecodeError, TypeError):
            history_data = []
        
        # Create message history
        message_history = ChatMessageHistory()
        
        # Restore previous messages
        for msg in history_data:
            if msg.get("role") == "user":
                message_history.add_message(HumanMessage(content=msg["content"]))
            elif msg.get("role") == "assistant":
                message_history.add_message(AIMessage(content=msg["content"]))
        
        # Create RAG-enhanced prompt with both personality and contextual messages
        prompt = create_rag_prompt(selected_person, personality_messages, contextual_messages, using_fallback=using_fallback, mood=mood)
        
        # Build the runnable pipeline using user's API key if provided, with mood-based temperature
        chain = prompt | get_llm(user_api_key, mood=mood)
        
        # Wrap with message history
        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: message_history,
            input_messages_key="input",
            history_messages_key="history",
        )
        
        # Generate response
        print(f"[RAG] Generating response with GPT-4 (temperature: {get_llm(user_api_key, mood=mood).temperature})...")
        result = chain_with_history.invoke(
            {"input": user_input},
            config={"configurable": {"session_id": str(chat_data_id)}}
        )
        
        # Extract response text
        response = getattr(result, "content", str(result))
        
        if not response.strip():
            response = f"Sorry, {selected_person} couldn't think of a response right now."
        
        print(f"[RAG] Response generated: '{response[:100]}...'")
        
        # Update conversation history in database (keep last 20 entries = 10 turns)
        history_data.append({"role": "user", "content": user_input})
        history_data.append({"role": "assistant", "content": response})
        
        # Keep only last 20 messages to save space
        chat_data.conversation_history = json.dumps(history_data[-20:])
        db.session.commit()
        
        print(f"[RAG] ===== Response complete =====\n")
        
        return response
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to generate response: {e}")
        import traceback
        traceback.print_exc()
        return f"Oops! Something went wrong: {str(e)}. Please try again."


def delete_vector_store(chat_data_id):
    """
    Delete vector store when chat is deleted.
    
    Args:
        chat_data_id: ID of the chat
    """
    try:
        persist_dir = os.path.join(CHROMA_DB_DIR, f"chat_{chat_data_id}")
        
        if os.path.exists(persist_dir):
            import shutil
            shutil.rmtree(persist_dir)
            print(f"[RAG] Deleted vector store for chat {chat_data_id}")
        
    except Exception as e:
        print(f"[RAG ERROR] Failed to delete vector store: {e}")
