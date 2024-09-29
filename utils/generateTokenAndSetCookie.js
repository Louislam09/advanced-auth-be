import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return token
}
export const generateResetPasswordToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1h"
    })
    return token
}
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded
}