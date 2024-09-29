import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs'
import { generateResetPasswordToken, generateTokenAndSetCookie, verifyToken } from "../utils/generateTokenAndSetCookie.js";
import { passwordResetEmail, resetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";

// GET
export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No user found' });
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
};


// POST
export const signup = async (req, res) => {
  try {
    // Validate user input
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new Error("All fields are required!");
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken()

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Save the user in the database
    await user.save();

    //   jwt
    generateTokenAndSetCookie(res, user._id)
    await sendVerificationEmail(user.email, verificationToken)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined
    await user.save()

    await sendWelcomeEmail(user.email, user.name)
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined
      }

    });
  } catch (error) {

  }

}

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const resendVerificationEmail = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No user found' });
    }

    const { email, verificationToken, verificationTokenExpiresAt } = req.user
    const tokenExpired = new Date(verificationTokenExpiresAt) < new Date();

    if (tokenExpired) {
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(401).json({ message: 'No user found' });
      }

      const verificationToken = generateVerificationToken()
      user.verificationToken = verificationToken
      user.verificationTokenExpiresAt = addDays(new Date(), 1);  // 24 hours

      await user.save()
      await sendVerificationEmail(user.email, user.verificationToken)

    } else {
      await sendVerificationEmail(email, verificationToken)
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'An error occurred while resending the verification email',
      error: error.message,
    });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateTokenAndSetCookie(res, user._id)
    user.lastLogin = new Date()
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        ...user._doc,
        password: undefined
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token")
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate the reset token (JWT or another method)
    const verificationToken = generateResetPasswordToken(user.id)

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${verificationToken}`

    // Create the reset URL
    user.resetPasswordToken = verificationToken
    user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour expiry

    await user.save()

    // Send the password reset email
    await passwordResetEmail(user.email, resetUrl)

    res.status(200).json({ success: true, message: 'Password reset email sent successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const resetPassword = async (req, res) => {

  const { newPassword } = req.body
  const { token } = req.params;

  try {
    const decodeToken = verifyToken(token)

    const user = await User.findById(decodeToken.userId)

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user does not exist' });
    }

    // Check if the token is expired
    if (Date.now() > user.resetPasswordExpiresAt) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword
    user.resetPasswordExpiresAt = undefined
    user.resetPasswordToken = undefined

    await user.save()

    await resetPasswordEmail(user.email)

    res.status(200).json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}