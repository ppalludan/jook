{
    "port": 8080,
    "username": "a",
    "password": "b",
    "repositories": [{
        "name": "ppalludan/foodiefriends",
        "branch": "develop",
        "process": [{
                "name": "list files",
                "exec": "ls -ls"
            },
            {
                "name": "list other",
                "exec": "ls * bat"
            }
        ]
    }]
}
