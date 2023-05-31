import request from "supertest";
import {
  blogsURI,
  blogNameString,
  blogDescriptionString,
  blogWebsiteUrlString,
  postsURI,
  postTitleString,
  postDescriptionString,
  postContentString,
  usersURI,
  userLoginString,
  userEmailString,
  userPasswordString
} from "./test.strings";
import { INestApplication } from "@nestjs/common";
let app: INestApplication;

export const postCreator = async (
  uri: string = postsURI,
  blogId: string,
  title: string = postTitleString,
  shortDescription: string = postDescriptionString,
  content: string = postContentString,
  authValue: string = "Basic YWRtaW46cXdlcnR5"

) => {
  return request(app)
    .post(uri)
    .send({
      uri,
      title,
      shortDescription,
      content,
      blogId
    })
    .set({Authorization : authValue})
}

export const userCreator = async (
  uri: string = usersURI,
  login : string = userLoginString,
  email : string = userEmailString,
  password : string = userPasswordString,
  authValue: string = "Basic YWRtaW46cXdlcnR5"

) => {
  return request(app)
    .post(uri)
    .send({
      login,
      email,
      password
    })
    .set({Authorization : authValue})
}

