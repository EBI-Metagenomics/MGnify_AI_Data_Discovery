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

## About the project:

This was written by undergraduate students at the University of Oxford in collaboration with [EMBL-EBI](https://www.ebi.ac.uk/) to be used with their [MGnify](https://www.ebi.ac.uk/about/teams/microbiome-informatics/mgnify/) microbiome data & analysis resource.

This repo contains the implementation of the 'MGnify AI powered data discovery platform' project that EBI presented to Oxford students. The overarching aim of the project is to provide MGnify users (generally biologists without technical CS know-how) to make full use of the MGnify resource without struggling over writing API calls. This means that they would be able to make plain text queries, interpreted by an LLM, and turned into a call for them, streamlining the process.