# utils
def filter_ws(text: str):
    text = text.replace("\n", r"\n")
    text = text.replace("\t", r"\t")
    return text

def add_details(prompt: str, details: dict[str, str]) -> str:
    """
    This method replaces all {variable} into their corresponding _VARIABLES.
    Its gonna be useful for dynamically changing the prompt.
    :param prompt:
    :param details:
    :returns prompt:
    """
    if details is None:
        return None

    for key, item in details.items():
        key = "{" + key + "}"
        item = filter_ws(item)

        prompt_new = prompt.replace(key, item)
        if prompt == prompt_new:
            print(f"[!] No {key} found. Please add the {key} to prompt.")
        else:
            prompt = prompt_new

    return prompt