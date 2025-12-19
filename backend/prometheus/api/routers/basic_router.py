from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import tempfile
import os
from pathlib import Path

from prometheus.factory import get_prometheus
from prometheus.actions.action_manager import ActionManager
from prometheus.data_models.shared import PrometheusOutput, UserInput
from prometheus.data_models.action import Action
from prometheus.data_models.shared.user_input import FileAttachment

router = APIRouter()

@router.post("/chat", response_model = PrometheusOutput)
async def chat(
    message: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[])
):
    """
    POST /api/chat

    Called by the frontend when the user sends a message.
    Accepts multipart/form-data with message and optional file attachments.
    
    :param message: Optional text message from user
    :param files: List of uploaded files
    :return PrometheusOutput:
    """
    file_attachments = []
    temp_files = []

    try:
        # Save each uploaded file to temporary location
        for uploaded_file in files:
            if not uploaded_file.filename:
                continue
                
            # Get file extension for proper temp file naming
            suffix = Path(uploaded_file.filename).suffix
            
            # Get mime type from uploaded file if available
            mime_type = uploaded_file.content_type
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            
            # Read and write file content
            content = await uploaded_file.read()
            temp_file.write(content)
            temp_file.close()
            
            temp_files.append(temp_file.name)
            
            # Create FileAttachment - the validator will auto-process the file
            # Note: Field name is source_type, not source
            file_attachments.append(
                FileAttachment(
                    source_type="upload",
                    source_path=temp_file.name,
                    filename=uploaded_file.filename,
                    mime_type=mime_type  # Pass mime_type so it's available for processing
                )
            )
        
        # Create UserInput - FileAttachment validator auto-processes files from source_path
        user_input = UserInput(
            message=message,
            files=file_attachments
        )
        
        # Process with agent
        agent = get_prometheus()
        output = agent.execute(user_input)
        return output
        
    except HTTPException as e:
        raise HTTPException(status_code = 500, detail = str(e))

    except Exception as e:
        # Handle other exceptions
        raise HTTPException(status_code = 500, detail = f"Error processing request: {str(e)}")

    finally:
        # Cleanup temporary files
        for temp_path in temp_files:
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception as e:
                # Log but don't fail if cleanup fails
                print(f"Warning: Failed to cleanup temp file {temp_path}: {e}")

@router.get("/actions", response_model = List[Action])
async def get_actions():
    """
    Returns a list of actions fetched from action_registry.
    :return List[Action]:
    """
    try:
        return list(ActionManager.ACTION_REGISTRY.keys())

    except HTTPException as e:

        raise HTTPException(status_code = 500, detail = str(e))