const User = require('../models/user')
const fs = require('fs');
const path = require('path');

module.exports.profile = function(req, res){
    // res.end('<h1>User Profile</h1>');
    // return res.render('user_profile', {
    //     title:  'Profile',
    //     profile: 'Profile Page'
    // });

    // console.log('#####',req.user);
    // if(locals.user){
    //     User.findById(req.user.id, function(err, user){
    //         if(err){
    //             console.log('error is showing', err); 
    //             return;
    //         }
    //         if (user){
    //             return res.render('user_profile', {
    //                 title: "User profile",
    //                 profile_user: user
    //             });
    //         }
    //         return res.redirect('/users/sign-in');
    //     });
    // }else{
    //     return res.redirect('/users/sign-in');
    // }

    User.findById(req.params.id, function(err, user){
        if(err){
            console.log('error is showing', err); 
            return;
        }
        if (user){
            return res.render('user_profile', {
                title: "User profile",
                profile_user: user
            });
        }
        // return res.redirect('/users/sign-in');
    });
}


module.exports.update = async function(req, res){
    // if(req.user.id == req.params.id){
    //     User.findByIdAndUpdate(req.params.id, req.body, function(err, user){
    //         if(err){
    //             console.log("error in update", err);
    //         }
    //         req.flash('success', 'Updated!');
    //         return res.redirect('back');
    //     });
    // }else{
    //     req.flash('error', "Unauthorized!")
    //     return res.status(401).send('Unauthorized');
        
    // }

    if(req.user.id == req.params.id){

        try{
            
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req, res, function(err){
                if (err) {console.log('*****Multer Error: ', err)}
                
                user.name = req.body.name;
                user.email = req.body.email;

                if (req.file){

                    if (user.avatar){
                        fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    }

                    // this is saving the path of the uploaded file into the avatar field in the user
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });


        }catch(err){
            req.flash('error', err);
            return res.redirect('back');
        }

    }else{
        req.flash('error', "Unauthorized!")
        return res.status(401).send('Unauthorized');
    }
}


//render the user sign up page
module.exports.signUp = function(req,res){
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_up',{
        title: "Codial | Sign Up"
    });
};


//render the user sign in page
module.exports.signIn = function(req,res){
    // if(req.isAuthenticated()){
    //     console.log('sign in done');

    //     return res.redirect('/users/profile');
    // }
    if (req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_in',{
        title: "Codial | Sign In"
    });
};


//get the sign up data
module.exports.create = function(req,res){
    if (req.body.password != req.body.confirm_password){
        req.flash('error', 'Passwords do not match');
        return res.redirect('back');
    }

    User.findOne({email: req.body.email}, function(err, user){
        if(err) {
            console.log('error in finging user in signing up');
            return
        }
        if (!user){
            User.create(req.body, function(err, user){
                if(err){
                    console.log('error in creating user while signing up');
                    return}
                    
                    return res.redirect('/users/sign-in')
            })
        }else{
            req.flash('success', 'You have signned up!')
            return res.redirect('back');
        }
    })
}


// sign in and create a session for the user
module.exports.createSession = function(req, res){
    console.log('log-in');
    req.flash('success', 'Logged in Sucessfully');
    return res.redirect('/');
};


module.exports.destroySession = function(req,res){
    req.logout();
    req.flash('success', 'You have logged out!');

    return res.redirect('/');
}
