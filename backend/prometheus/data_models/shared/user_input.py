from prometheus.data_models.base import BaseContext

class UserInput(BaseContext):
    content: str | None = None