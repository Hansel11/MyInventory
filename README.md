# MyInventory

MyInventory is a simple CRUD web application made using React and Firebase.  

## Background

MyInventory serves as a sample warehouse / inventory management application that can be deployed on the internet for free.  
This is my first React and Firebase project, serving as my introduction to the technology.  
Prior to this, the project was first made with a backend application and SQL database, before deciding to migrate the entire backend structure.  
Admittedly, there was a few things I could've done better, like utilizing a state management library like Redux.  
As of right now, I **do not intend to continue** further updates on this project.  

## Usage

You can access the demo of this web application on <https://sample-warehouse-app.web.app/>  

I have setup a dummy account that you can use in this web app (Read Data only).  
You can use it by clicking on the 'Login as Guest' Button, or enter these credentials:  
**Username:** guest@myinventory.com  
**Password:** guest1234  
To modify the data, please follow the instructions below to create your own firebase project and setup an admin account.  
  
The MyInventory application data structure can be summarized as such:  
```
Warehouses -> Items -> Mutations
```
Where each arrow represents a *one-to-many* relation.  
There were originally feature for a more complex Role-based access limitation in the original code.  
However, because Firebase Authentication does not support user data storage natively, I do not intend to migrate it.  

## Setup

Here is a brief instruction to setup this web application for yourself:  
* Create a new firebase project
* Setup Authentication and Firestore Database
* Create a User in the Authentication page (using email authentication) for later use
* Setup Firebase project for web application in your Firebase project to get the application credentials
* Clone the repository and add the credentials to a '.env' file (use the '.env sample' file)
* Populate the database with initial data (you can use the sample in app/components/utils/ImportData.tsx)
* Run `npm run dev`to test the application
* Run the following command to connect your application with the console and publish it
```sh
npm install -g firebase-tools
firebase login
###### continue the login process in your browser ######

firebase init hosting
###### setup the hosting according to your needs ######

npm run build
firebase deploy
```

## Evaluation

Feel free to use and modify this code to suit your needs.   
If you find this repository helpful, please give it a star.🌟  
You can contact me over on: 📧 <hansel.sentosa2@gmail.com>  
