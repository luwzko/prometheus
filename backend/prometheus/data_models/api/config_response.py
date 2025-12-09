from pydantic import BaseModel, Field

class ModelConfigResponse(BaseModel):
    """Public version of ModelConfig - excludes sensitive fields"""
    name: str
    max_tokens: int = Field(le=8192)
    temperature: float = Field(ge=0.0, le=1.0)