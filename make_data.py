import json
import string
import random

make_name = lambda: "".join([random.choice(string.ascii_lowercase) for i in range(random.randint(5, 10))])

levels = 16

root = {"name": make_name(), "children": [], "title": make_name()}
todo_stack = [root]

for level in range(0, levels):
    todo = todo_stack
    todo_stack = []
    for todo in todo:
        if random.randint(0, 100) > 40:
            for i in range(random.randint(0, 5)):
                todo["children"].append({"name": make_name(), "title": make_name()})
                todo_stack.append(todo["children"][-1])
                todo["children"][-1]["children"] = []

print(json.dumps(root, indent=4, separators=(',', ': ')))
