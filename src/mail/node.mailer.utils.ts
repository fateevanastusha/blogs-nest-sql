import * as nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testfornodemailerfateeva@gmail.com", // generated ethereal user
    pass: "htyzhtdkicohwgnp", // generated ethereal password
  },
});