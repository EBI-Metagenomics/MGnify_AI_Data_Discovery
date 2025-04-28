To run the service, do the following:

If you are using Windows, use the following commands from the root directory of the repository.

Download Git Bash, and open a bash terminal. Then run `./start_all.sh`

If you are using Mac or Linux, run the following commands:
First, give access to the shell script to be executable: `chmod +x start_all.sh`
Then run `./start_all.sh`


If you want to run the service manually to debug, follow these instructions in separate terminals.

run the following command:

`export FLASK_APP=oxford_mgnify.api.app`

And after that, run `npm install; npm start` in the \front_end folder

And after that, run `flask run` from the \back_end\src folder.

Now, you can test the program by entering in the query from the front end without having to use main.py
