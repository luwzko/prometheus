from typing import List, Tuple, Generic, TypeVar
from pydantic import BaseModel

TInput = TypeVar("TInput", bound = BaseModel)
TOutput = TypeVar("TOutput", bound = BaseModel)

class ConversationHistory(Generic[TInput, TOutput]):
    """
    Manages conversation history with sliding window.
    TInput - Type of user input
    TOutput - Type of agent output
    """
    def __init__(self, max_length: int = 10):
        """
        Initializes ConversationHistory.
        :param max_length:
        """
        self._history: List[Tuple[TInput, TOutput]] = []
        self._max_length = max_length

    def add_to_history(self, user_input: TInput, response: TOutput):
        """
        Add interaction to history.

        :param user_input:
        :param response:
        :return:
        """
        self._history.append((user_input, response))

        # sliding window: keep last N interactions
        if len(self._history) > self._max_length:
            self._history = self._history[-self._max_length:]

    def clear(self):
        self._history = []

    def get_context_msg(self) -> List[dict]:
        """
        Formats history as LLM context messages.
        returns list of dicts with role and content values
        """
        messages = []

        for user_input, agent_output in self._history:
            messages.append({
                "role": "user",
                "content": user_input.content
            })

            messages.append({
                "role": "assistant",
                "content": agent_output.model_dump_json()
            })

        return messages

    def __len__(self):
        """Support len() function."""
        return len(self._history)

    def __iter__(self):
        """Support iteration over history."""
        return iter(self._history)

    def __repr__(self):
        return f"ConversationHistory(size={len(self._history)}, max={self._max_length})"