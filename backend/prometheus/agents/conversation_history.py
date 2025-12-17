from typing import List, Tuple, Generic, TypeVar, Type
from pydantic import BaseModel

import json
from pathlib import Path

import logging

TInput = TypeVar("TInput", bound = BaseModel)
TOutput = TypeVar("TOutput", bound = BaseModel)

class ConversationHistory(Generic[TInput, TOutput]):
    """
    Manages conversation data with sliding window.
    TInput - Type of user input
    TOutput - Type of agent output
    """
    def __init__(self, logger: logging.Logger, input_model: Type[TInput], output_model: Type[TOutput], max_length: int = 10, save_folder: str = "data/conversations"):
        """
        Initializes ConversationHistory.
        :param max_length:
        """
        self.logger = logger.getChild("conversation_history")

        self.input_model = input_model
        self.output_model = output_model
        self._max_length = max_length

        self.history_dir = Path(save_folder)
        self.history_dir.mkdir(parents = True, exist_ok = True)

        self.history_file = self.history_dir / "history.jsonl"

        self._history: List[Tuple[TInput, TOutput]] = self._load_history()

    def _load_history(self):
        """
        Loads history from a file. If the history.jsonl doesn't exists, it creates it.
        :return history: List[Tuple[input_model, output_model]]:
        """
        if not self.history_file.exists():
            self.history_file.touch()

            return []

        history = []
        with self.history_file.open("r") as f:
            for line_num, line in enumerate(f, start = 1):
                line = line.strip()

                if not line:
                    continue

                # expect: (user_input, agent_output)
                pair = json.loads(line)

                if not isinstance(pair, list) or len(pair) != 2:
                    self.logger.error(f"Line {line_num}: Expected array of 2 elements.")
                    continue

                user_input = self.input_model.model_validate(pair[0])
                agent_output = self.output_model.model_validate(pair[1])

                history.append((user_input, agent_output))

        return history

    def _save_message(self, user_input: TInput, response: TOutput):
        """
        Append interaction to file.
        :param user_input:
        :param response:
        :return:
        """
        pair = [user_input.model_dump(), response.model_dump()]

        with self.history_file.open("a") as f:
            f.write(json.dumps(pair) + "\n")

    def add_to_history(self, user_input: TInput, response: TOutput):
        """
        Add interaction to data.

        :param user_input:
        :param response:
        :return:
        """
        self._history.append((user_input, response))
        self._save_message(user_input, response)

        # sliding window: keep last N interactions
        if len(self._history) > self._max_length:
            self._history = self._history[-self._max_length:]

    def clear(self):
        self._history = []

    def get_context_msg(self) -> List[dict]:
        """
        Formats data as LLM context messages.
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
        """Support iteration over data."""
        return iter(self._history)

    def __repr__(self):
        return f"ConversationHistory(size={len(self._history)}, max={self._max_length})"