import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS, // remember password is very sensitive, so dont use any extra space in the password of .env file
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: text,
    });

    return Response.json({
      success: true,
      message: "Check your email to reset the password",
    });
  } catch (error) {
    console.log("Email sending error: ", error);
    return Response.json({
      success: false,
      message:
        "Email couldn't be sent to your email | server error, please try again",
    });
  }
};

export { sendEmail };
