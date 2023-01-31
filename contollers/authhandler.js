const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { promisify } = require('util');
const Aynsccatch = require("./../utils/Aynsccatch.js")
const Auth = require("../models/auth_user.js")
const AppError = require("./../utils/apperror.js")
const sendEmail = require('./../utils/email');

const createtoken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}
const sendtoken = (user, statuscode, res) => {
    const token = createtoken(user._id);
    return res.status(statuscode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}
exports.signup = async (req, res, next) => {
    const { name, password, email, /*confirm_password */ } = req.body;
    if (!email) {
        return res.status(400).json({
            message: "email not present",
        })
    }
    if (!name || !password  /*!confirm_password*/) {
        return res.status(400).json({
            message: "Username or Password not present",
        })
    }
    try {
        const s = await Auth.findOne({ email: email });
        if (!s) {
            const newUser = await Auth.create({
                name: name,
                email: email,
                password: password,
                //confirm_password: confirm_password
            });
            const token = createtoken(newUser._id);
            //const sa = 
            newUser.password = await bcrypt.hash(newUser.password, 12);
            newUser.save();
            // newUser.confirm_password = "null";
            // if (!sa) {
            //     return res.status(400).json({
            //         status: "fail",
            //         message: "email is already registered",
            //     })
            // }
            return res.status(200).json({
                status: "success",
                token: token,
                user: {
                    newUser
                }
            })
        }
        else {
            return res.status(400).json({
                status: "fail",
                message: "email is already registered",
            })
        }
        // else {
        //     return res.status(400).json({
        //         status: "fail",
        //         message: "Incorrect password or username",
        //     })
        // }
    } catch (err) {
        return res.status(400).json({
            message: "error occured",
            error: err,
        })
    }
    // sendtoken(newUser, 201, res);
};
// exports.signup = Aynsccatch(async (req, res, next) => {
//     const newUser = await Auth.create({
//         name: req.body.name,
//         email: req.body.email,
//         role: req.body.role,
//         password: req.body.password,
//         confirm_password: req.body.confirm_password,
//     });

//     newUser.save();
//     sendtoken(newUser, 201, res);
// });
exports.login = Aynsccatch(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await Auth.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client

    sendtoken(user, 200, res);
});

exports.protect = Aynsccatch(async (req, res, next) => {
    //1 getting token and check of it's there
    //2 verification
    //3 check if user is exists
    //4 vheck if usr changed passwords after the token was issued
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Auth.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
})
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};
exports.forgetpassword = Aynsccatch(async (req, res, next) => {
    //1 varify
    const user = await Auth.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }
    //create token
    const resetToken = user.createpasswordtokenreset();
    //save 
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!', 500),
        );
    }
})
exports.resetpassword = async (req, res, next) => {
    // get user based on  token
    //if token is not expired so,there is user ,set the new password
    // update changedpasswordAt property for the user
    //login the user in ,no send jwt //
    // if for uour prorpose we send confirmation data of success
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await Auth.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.confirm_password = req.body.confirm_password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // user.status(201).json({

    // })
    sendtoken(user, 201, res);
    //we have to send some reponse
}
// exports.updatepassword = async (req, res, next) => {
//     //find the user
//     //check if posted current password is correct
//     //if so ,update password
//     //login in user, send jwt
//     const user = await Auth.findById(req.user.id).select('+password');
//     if (!(await user.correctpassword))

// }
exports.all = async (req, res) => {
    const users = Auth.find();
    if (!users) {
        return next(new AppError('no users', 200));
    }
    res.status(200).json({ users: users });
}