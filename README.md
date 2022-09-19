# ShiftApp_Node.Js
 
This is a server application to manage shifts.

The main project contains one application using TypeScript for back end, and for the databse I use MongoDB. 

In this app an user can add create an account where it will recieve and email via "Mailtrap" and login. After ths use is logged in he/she will recieve a jwt witch contains the id of the user, permissionId, the issue time and the expire time. Any user can update data about them, update the password or even cand delete the account. Users can add shifts, update them, delete or find all shifts that are created by each user. The same thing for comments as well.

I created the "forgot password" feature, where an user can reset his password using email. After the endpoint is used an email is sent using "Mailtrap", in the template user can find a link where it can reset the password

I developed the admin part, where an admin could get all the users,shifts and comments that exists and are still active in the databse, an admin can update and delete an user or a shift or a comment. 

In MongoDB we can find 4 collections:
1.Users
2.Shifts
3.Permissions(User or Admin)
4.Comments

