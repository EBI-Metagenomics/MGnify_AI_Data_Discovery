# Oxford_MGnify_project

#### Setup
To get started with this project, I suggest you run the following commands in the main folder:

```
python -m venv venv
```

or use `python3` depending on which python packaging manager you are using. After doing so, run the following command. 

Windows:
```
venv\Scripts\activate
```
Linux\MacOS:
```
source venv/bin/activate
```

After doing so, run the following command:
```
pip install -r requirements.txt
```

Please branch into your own branches when working on new features. This will help us avoid merge conflicts and a lot of headaches :(

I've set up the code structure to be such that we have api, data, and query split into their own folders. If anyone else has a better idea on how we should structure our codebase, then feel free to mention it before we begin implementing.
