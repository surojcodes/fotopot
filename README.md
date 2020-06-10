# fotopot
> REST API using Node.js (Express) and MongoDB (mongoose) for a photo sharing social app

## Usage
Rename config/config.env.env to config/config.env and update the settings values of your own

## Install Dependencies
```
npm install
```

## Run App
```
# In development mode
npm run dev

#In production mode
npm start
```

## Database Seeder
To seed your database with the data in data folder, run

```
# To import data
node seeder -i

# To delete data
node seeder -d
```
***
## Features
#### Auth
* User Registration with email verification
* Request Resending email verification
* Login and Logout (JWT Authentication)
* Reset Password via email
* Upload profile Image 
* View own profile
        
#### Post
* A post primarily contains image, caption and tags for image
* User (verified or unverified) is able to see all the posts from all users (with pagination) latest first (sorting field and order can be given as query)
* A verified user (email verified) can 
  * create posts.
  * add image to post.
  * view all of his/her post.
  * view any other user's post.
  * update his/her post.
  * delete his/her post. (*Admin can delete any user's post*)
  **Deleting post will delete the associated image and all the comments**
* A verified user can like/unlike a post.
* A verified user can 
  * comment on post.
  * view all the comments in the post.
  * update his/her comment. (*comment will be marked edited*)
  * delete his/comment. (*Admin can delete any user's comment*)
  * like/unlike comment on post.

#### User
* A verified user can see his/her profile
* A verified user can see other user's users profile and posts
* A verified user can update his/her detail
* A verified user can delete his/her account.  (*Admin can delete any user's account*)
  **Deleting user will delete his profile image, his posts, image of the post and the comments on the posts**

#### Admin
* A normal user (publisher) can not update his/her role as admin
* An admin must be made by changing the database field manually
* An admin can view all users
* An admin can delete any user account
* An admin can delete any comment of any user
* An admin can delete any post.
    *Delete privilege is given to admin, so that fotopot members follow the app's code of conduct*

#### Security Features
* NoSQL injection secure
* Security headers has been added
* Cross-site scripting(XSS) secure
* Rate Limit has been set
  * An IP can request upto 100 times within 10 min
* Cross-Origin Resource Sharing (CORS) enabled
* HTTP Param Pollution prevented

***
## Demo
Simple Documentation with example[here](https://surojmaharjan0.github.io/fotopot/)
Postman Documentation with example [here](https://documenter.getpostman.com/view/7716156/SzzegfAC)
* Version **1.0**
* Author **Suroj Maharjan**

*If you find any bugs please let me know :)*