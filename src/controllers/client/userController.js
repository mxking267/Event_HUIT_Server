const {
  createUserService,
  loginService,
  getUserService
} = require('../../services/userService')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

const User = require('../../models/userModel')
const ForgotPassword = require('../../models/forgot-passwordModel')

const generateHelper = require('../../helpers/generateHelper')
const sendMailHelper = require('../../helpers/sendMailHelper')


const createUser = async (req, res) => {
  const { email, password, student_code, className, full_name } = req.body
  console.log(req.body)
  const data = await createUserService(
    email,
    password,
    student_code,
    className,
    full_name
  )
  return res.status(200).json(data)
}

const handleLogin = async (req, res) => {
  const { email, password } = req.body
  const data = await loginService(email, password)

  return res.status(200).json(data)
}

const getUser = async (req, res) => {
  const data = await getUserService()
  return res.status(200).json(data)
}

const getAccount = async (req, res) => {
  return res.status(200).json(req.user)
}


const forgotPassword = async (req, res) => {
  const email = req.body.email;
  const existUser = await User.findOne({
    email: email
  });

  if (!existUser) {
    res.json({
      code: "error",
      message: "Email không tồn tại!"
    });
    return;
  }

  const existEmailInForgotPassword = await ForgotPassword.findOne({
    email: email
  });

  if (!existEmailInForgotPassword) {
    const otp = generateHelper.generateRandomNumber(6);
    const data = {
      email: email,
      otp: otp,
      expireAt: Date.now() + 5 * 60 * 1000
    };

    const record = new ForgotPassword(data);
    await record.save();

    const subject = "Xác thực mã OTP";
    const text = `Mã xác thực của bạn là <b>${otp}</b>. Mã OTP có hiệu lực trong vòng 5 phút, vui lòng không cung cấp mã OTP cho bất kỳ ai.`;
    sendMailHelper.sendMail(email, subject, text);
  }

  res.json({
    code: "success",
    message: "Gửi mã OTP thành công!"
  })
}

const otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const existRecord = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if (!existRecord) {
    res.json({
      code: "error",
      message: "Mã OTP không hợp lệ!"
    });
    return;
  }

  const user = await User.findOne({
    email: email
  }).select('email full_name');

  //create an access token
  const payload = {
    email: user.email,
    full_name: user.full_name
  }

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
  
  res.json({
    code: "success",
    message: "Mã OTP hợp lệ!",
    token: access_token, 
    user: payload
  });
}


const resetPassword = async (req, res) => {
  const password = req.body.password;
  const token = req.body.token;
  const user = req.body.user

  if (token) {
    //verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      decodeUser = {
        email: decoded.email,
        full_name: decoded.name
      }
      
      if (decodeUser.email != user.email || decodeUser.full_name != user.full_name) {
        return res.status(400)
      }
      
      const saltRounds = 10
      //hash user password
      const hashPassword = await bcrypt.hash(password, saltRounds)
      await User.updateOne({
        email: user.email 
      }, {
        password: hashPassword
      });

    } catch (error) {
      return res.status(401).json({
        error: error.message,
        message: 'Token bị hết hạn/hoặc không hợp lệ'
      })
    }
  } 
  else {
    return res.status(401).json({
      message: 'Bạn chưa gửi Access Token ở body/Hoặc token bị hết hạn'
    })
  }

  res.json({
    code: "success",
    message: "Đổi mật khẩu thành công!"
  });
}

module.exports = {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  forgotPassword,
  otpPassword,
  resetPassword
}
