"""Automatically creates tags.json and tasks.json from seed.csv
"""

import csv
import json
import os.path

tasks = dict()
tags = dict()

with open(os.path.join(__file__, os.path.pardir, 'seed.csv')) as seed_file:
    for task in csv.DictReader(seed_file):
        tasks[task['id']] = (task)
        for tag in task['tags'].split(','):
            if tag:
                tags[tag] = tag
    with open(os.path.join(__file__, os.path.pardir, 'tasks.json'), 'w') as f:
        json.dump(tasks, f)
    with open(os.path.join(__file__, os.path.pardir, 'tags.json'), 'w') as f:
        json.dump(tags, f)