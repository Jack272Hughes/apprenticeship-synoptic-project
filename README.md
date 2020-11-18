# Synoptic Project

For my synoptic project I have chosen to do the quiz master app. All documentation should be enclosed in a PDF.

# Seed Data

When the app is started using any of the methods listed below, you can access the website at http://localhost:3000 and there will be some data already inserted into the database.

The first is a simple quiz that shows off both multiple answer and single answer questions.

The second is three predefined users each with their associated role which you can login to from the login screen:

```
Username: Admin
Password: Hello123

Username: Moderator
Password: Hello123

Username: User
Password: Hello123
```

To view this data you can enter the mongodb docker container and poke around using the following commands:

```
// Enter the container
docker exec -it <mongo container name> /bin/bash

// Enter mongodb
mongo

// Target the correct database
use quizmaster

// Show all collections
show collections

// View all data for a collection
db.<collection-name>.find({})
```

# Starting Quizmaster App

## The Docker Way

Make sure you have got the following modules install

```
brew install docker
brew install docker-compose
brew install yarn
```

and then simply type the two following command to build the necessary images:

```
yarn docker:build
yarn docker:start
```

Once you are finished you can either type `yarn docker:stop` to stop the docker containers or `yarn docker:clean` to stop the containers and remove any leftover images.

## The Manual Way

Should the docker containers not properly boot up then you can manually start the app, of which there are four parts to start and setup. You will also need node installed for these to work.

### Start MongoDB Instance

The following command will start a mongodb instance in a docker container named "mongo-db" and connect to port 27017

```
docker run -d -p 27017:27017 --name mongo-db mongo
```

Once this is running, from the root folder, run the following command to get the simple pre-made quiz and three users with the different roles as explained later.

```
node ./backend/utils/setupDatabase.js
```

### Start Frontend

Simply cd into the frontend folder and type `yarn start`

### Start Server

Simply cd into the backend folder and type `yarn start:server`

### Start Auth Service

Simply cd into the backend folder and type `yarn start:auth`
