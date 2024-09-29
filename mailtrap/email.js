import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Verify your email',
            html: VERIFICATION_EMAIL_TEMPLATE(verificationToken),
            category: 'Email Verification'
        })
        console.log('Email sent successfully', response)
    } catch (error) {
        console.log(`Error sending verification email: ${error}`)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

export const passwordResetEmail = async (email, resetUrl) => {
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Forgot Password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE(resetUrl),
            category: 'Forgot Passwordreset'
        })
        console.log('Forgot Password email sent successfully', response)
    } catch (error) {
        console.log(`Error sending Forgot Password email: ${error}`)
        throw new Error(`Error sending Forgot Password email: ${error}`)
    }
}
export const resetPasswordEmail = async (email, resetUrl) => {
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Password Reset email',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: 'Password Reset'
        })
        console.log('Password reset email sent successfully', response)
    } catch (error) {
        console.log(`Error sending Password Reset email: ${error}`)
        throw new Error(`Error sending Password Reset email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "100adeec-a0df-4401-8be3-c28b128ca589",
            // template_uuid: "d94f6fa7-d74c-40dd-bc11-71fd9a62dbca",
            // template_uuid: "c817e6bac57512693dee15b00b94edc8",
            template_variables: {
                "company_info_name": "Auth App",
                "name": name
            }
        })
        console.log('Welcome Email sent successfully', response)
    } catch (error) {
        console.log(`Error sending Welcome email: ${error}`)
        throw new Error(`Error sending Welcome email: ${error}`)
    }
}