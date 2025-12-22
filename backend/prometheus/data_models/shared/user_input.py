import base64

from prometheus.data_models.base import BaseContext
from pydantic import BaseModel, Field, model_validator

from typing import Optional, List, Literal

from pathlib import Path

MIME_TYPE_MAP = {
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".md": "text/markdown",
    ".html": "text/html",

    ".json": "application/json",
    ".js": "application/javascript",
    ".py": "application/python",
    ".xml": "application/xml",

    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
}

SupportedMimeTypes = Literal[
    # Text formats
    "text/plain",
    "text/csv",
    "text/markdown",
    "text/html",

    # Code formats
    "application/json",
    "application/javascript",
    "application/python",
    "application/xml",

    # Image formats
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
]


def _detect_mime_type(extension: str) -> Optional[SupportedMimeTypes]:
    """Maps file extension to mime type."""
    return MIME_TYPE_MAP.get(extension.lower())

class FileAttachment(BaseModel):
    """
    FileAttachment defines what data attachments contain
    """
    # path of the file and what type of upload is it.
    source_path: Optional[str] = None
    source_type: Literal["raw", "upload", "url"] = "raw"
    # filename and files contents
    filename: Optional[str] = None
    content: str = ""
    mime_type: Optional[SupportedMimeTypes] = None

    @model_validator(mode = "after")
    def process(self) -> "FileAttachment":
        """After the model is initialized it processes the file attachment."""
        if self.source_type == "raw" and self.content:
            return self

        if self.source_type == "upload" and self.source_path:
            self._load_from_upload()

        elif self.source_type == "url" and self.source_path:
            self._load_from_url()

        return self

    def _load_from_upload(self):
        """Helper: Load and read the file if it's uploaded. Converts images to base64."""
        path = Path(self.source_path)

        if not self.mime_type:
            self.mime_type = _detect_mime_type(path.suffix)

        if self.mime_type.startswith("image/"):
            with open(path, "rb") as f:
                self.content = base64.b64encode(f.read()).decode("utf-8")
        else:
            self.content = path.read_text(encoding = "utf-8")

        if not self.filename:
            self.filename = path.name

    def _load_from_url(self):
        """Helper: Handle URL (store URL directly for now)"""
        self.content = self.source_path

        if not self.filename:
            self.filename = self.source_path.split("/")[-1]

class UserInput(BaseContext):
    """
    UserInput defines what can or will the user provide.
    The user can provide messages, images and files.
    """
    message: Optional[str] = Field(default = None, description = "The text message from user")
    files: Optional[List[FileAttachment]] = Field(default_factory = [])

    def build_message_block(self):
        """
        Builds message block for user_input, if it contains files it appends user messages with file contents.
        :return:
        """
        text_blocks = []
        image_blocks = []

        # Only add message text block if message is provided
        if self.message:
            text_blocks.append({"type": "text", "text": self.message})

        for att in self.files:
            if att.mime_type and att.mime_type.startswith("image/"):
                # if the source is url, create a message with image url
                if att.source_type == "url":
                    image_blocks.append({
                        "type": "image_url",
                        "image_url": {"url": att.content}
                    })
                # if the source is upload, it creates the image message but with image contents encoded in base64
                elif att.source_type == "upload":
                    image_blocks.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{att.mime_type};base64,{att.content}"
                        }
                    })
            # default create message with filename and file contents
            else:
                text_blocks.append({
                    "type": "text",
                    "text": f"[File: {att.filename}]\n {att.content}"
                })

        content = text_blocks + image_blocks
        
        # Ensure we have at least some content
        if not content:
            # If no message and no files, create a default message
            content = [{"type": "text", "text": ""}]
        
        return {
                "role": "user",
                "content": content
        }
