from prometheus.actions.action_manager import action

import subprocess as sp

@action(
    "Execute",
    "Executes system commands",
    "output"
)
def execute(cmd: str):
    try:
        out: sp.CompletedProcess = sp.run(
            cmd,
            shell = True,
            capture_output= True,
            text = True
        )

        stdout = out.stdout
        stderr = out.stderr

        return stdout if stdout != "" else stderr

    except sp.SubprocessError:
        return f"Error while doing {cmd}"