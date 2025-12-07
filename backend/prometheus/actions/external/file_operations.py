from prometheus.actions.action_manager import action

@action(
    "FileWrite",
    "Writes `content` to a `file`",
    "success"
)
def file_write(file: str, content: str):
    try:
        with open(file, "w+") as f:
            f.write(content)
    except Exception as e:
        return False

    return True

@action(
    "FileRead",
    "Reads contents of `file`",
    "contents"
)
def file_read(file: str):
    contents: str
    try:
        with open(file, "w+") as f:
            contents = f.read()

        return contents
    except FileNotFoundError:
        return "FileNotFound!"