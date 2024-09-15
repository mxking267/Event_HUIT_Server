const User = require("../models/userModel");
const { createUserService, loginService, getUserService } = require("../services/userService");
const QRCode = require('qrcode');


module.exports.createUser = async (req, res) => {
    const { name, email, password, student_code, lophoc } = req.body;
    console.log(req.body)
    const data = await createUserService(name, email, password, student_code, lophoc);
    return res.status(200).json(data)
}

module.exports.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);

    return res.status(200).json(data)
}

module.exports.getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data)
}

module.exports.getAccount = async (req, res) => {

    return res.status(200).json(req.user)
}


exports.registerEvent = async (req, res) => {
    try {
        const regisInfor = req.body;
        if (regisInfor) {

            // Tạo dữ liệu QR code
            const data = { student_code: regisInfor.student_code, eventId: regisInfor.eventId };

            const qr_code = await QRCode.toDataURL(JSON.stringify(data));

            // Dữ liệu cần thêm vào event registration
            const addData = {
                event_id: regisInfor.eventId,
                qr_code: qr_code,
                registration_date: new Date(),
                check_in_status: false,
                check_out_status: false
            };
            
            // Tìm và cập nhật User, thêm event vào mảng `events_registered`
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { $push: { events_registered: addData } }, 
                { new: true, runValidators: true }
            );

            console.log(req.params);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } else {
            return res.status(400).json({ message: 'Bad request' });
        }
    } catch (error) {
        console.error('Error registering event:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};