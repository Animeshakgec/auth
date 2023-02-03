const Profile = require('./../models/profile_model')
const Auth = require('./../models/auth_user')
const AppError = require('./../utils/apperror')
const Aynsccatch = require('./../utils/Aynsccatch');
exports.addnew = async (req, res, next) => {
    try {
        const { firstname, lastname, phonenumber, imageurl, description } = req.body;
        const person = await Auth.findById(req.user._id);
        console.log(person);
        if (!person) {
            console.log('fuck');
            return res.status(401).json({
                status: "fail",
                message: "please login first then, add profile data"
            });
            //return next(new AppError('please login first then, add profile data', 401));
        }
        const user = await Profile.findOne({ email: person.email });
        if (user) {
            console.log('fuck');
            return res.status(401).json({
                status: "fail",
                message: "you already have profile account"
            });
            // return next(new AppError('you already have profile account', 201));
        }
        var data = new Profile({
            firstname: firstname,
            lastname: lastname,
            phonenumber: phonenumber,
            email: person.email,
            imageurl: imageurl,
            description: description,
        })
        const finaldata = await data.save();
        if (finaldata) {
            return res.status(200).json({
                status: "success",
                firstname: data.firstname,
                lastname: data.lastname,
                phonenumber: data.phonenumber,
                email: data.email,
                imageurl: imageurl,
                description: description,
            });
        }
    } catch (err) {
        return res.status(401).json({
            status: "fail",
            message: "some error occered"
        });
    }
};
exports.updateprofile = Aynsccatch(async (req, res, next) => {
    const { firstname, lastname, phonenumber, email, imageurl, description } = req.body;
    const person = await Profile.findOne({ email: req.user.email });
    if (!person) {
        return res.status(200).json({
            status: "fail",
            message: "your profile account is not created "
        });
    }
    // const data = Profile({
    //     name: name ? name : person.name,
    //     imageurl: imageurl ? imageurl : person.imageurl,
    //     description: description ? description : person.description,
    // })
    const changeprofiledata = await Profile.findOneAndUpdate({ email: req.user.email }, {
        $set: {
            firstname: firstname != null ? firstname : person.firstname,
            lastname: lastname != null ? lastname : person.lastname,
            phonenumber: phonenumber != null ? phonenumber : person.phonenumber,
            email: email != null ? email : person.email,
            imageurl: imageurl != null ? imageurl : person.imageurl,
            description: description != null ? description : person.description,
        }
    }
    )
    const yes = await changeprofiledata.save();
    if (yes) {
        res.status(201).json({
            status: "success",
            firstname: `${firstname !== null ? firstname : yes.firstname}`,
            lastname: `${lastname !== null ? lastname : yes.lastname}`,
            phonenumber: `${phonenumber !== null ? phonenumber : yes.phonenumber}`,
            email: yes.email,
            imageurl: `${imageurl !== null ? imageurl : yes.imageurl}`,
            description: `${description != null ? description : yes.description}`,
        })
    }
    else {
        res.status(201).json({
            status: "fail",
            firstname: yes.firstname,
            lastname: yes.lastname,
            phonenumber: yes.phonenumber,
            email: yes.email,
            imageurl: yes.imageurl,
            description: yes.description,
        })
    }
})
exports.getprofile = Aynsccatch(async (req, res, next) => {
    const userinfo = await Profile.findOne({ email: req.user.email });
    if (!userinfo) {
        // return next(new AppError('you are new user,so create very first profile ', 201));
        res.status(201).json({
            status: "fail",
            message: 'you are new user,so create very first profile ',
        })
    }
    res.status(201).json({
        status: "success",
        firstname: userinfo.firstname,
        lastname: userinfo.lastname,
        phonenumber: userinfo.phonenumber,
        email: userinfo.email,
        imageurl: userinfo.imageurl,
        description: userinfo.description,
    })
})