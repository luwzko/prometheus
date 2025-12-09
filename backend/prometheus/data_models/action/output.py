from ..base import BaseContext
from typing import Optional, List, Any

class ActionOutput(BaseContext):
    source: Optional[str] = None
    variable: Optional[str] = None
    result: Any = None