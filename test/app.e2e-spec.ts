import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from "@nestjs/common";
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { createApp } from "./create.app";
import { BusinessService } from "../src/business.service";
import { UsersRepository } from "../src/api/superadmin/users/users.repository";

describe('AppController (e2e)', () => {
  jest.setTimeout(3 * 60 * 1000)
  let service;
  let appRaw: INestApplication;
  let server;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).overrideProvider(BusinessService)
      .useValue({
        sendConfirmationCode (email : string, confirmationCode : string){
        return Promise.resolve(confirmationCode)
        },
        sendRecoveryCode (email : string, confirmationCode : string){
          return Promise.resolve(confirmationCode)
        },
      })
      .compile();
    appRaw = moduleFixture.createNestApplication();
    let app = createApp(appRaw)
    await app.init();
    server = await app.getHttpServer()
    service = app.get<UsersRepository>(UsersRepository)
  });

  beforeAll(async () => {
    //runDb()
    await request(server)
      .delete('/testing/all-data')
      .set({ Authorization: "Basic YWRtaW46cXdlcnR5" })
      .expect(204)
  })

  let token_1 : any = null
  let token_2 : any = null
  let tokenOfBannedUser : any = null
  let createResponseBlog_1 : any = null
  let createResponsePost_1 : any = null
  let createResponsePost_2 : any = null
  let createResponseBlog_2 : any = null
  let createResponseUser_1 : any = null
  let createResponseUser_2 : any = null
  let createResponseComment_1 : any = null
  let createResponseComment_2 : any = null
  let res : any = null

  //SA testing

  it ('SA check empty blogs array', async  () => {
    const res = await request(server)
      .get('/sa/blogs')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
    expect(res.body).toStrictEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
    expect(res.status).toBe(200)
  })

  it ('SA check empty user', async  () => {
    const res = await request(server)
      .get('/sa/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
    expect(res.body).toStrictEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
    expect(res.status).toBe(200)
  })

  it ('SA create 1 user', async  () => {
    createResponseUser_1 = await request(server)
      .post('/sa/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        login: 'user1',
        password: 'qwerty',
        email: 'user1@gmail.com'
      })
      .expect(201)
    expect(createResponseUser_1.body).toStrictEqual({
      "banInfo": {
        "banDate": null,
        "banReason": null,
        "isBanned": false
      },
      "createdAt": expect.any(String),
      "email": "user1@gmail.com",
      "id": expect.any(String),
      "login": "user1"
    })
  })

  it ('SA create 2 user', async  () => {
    createResponseUser_2 = await request(server)
      .post('/sa/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        login: 'user2',
        password: 'qwerty',
        email: 'user2@gmail.com'
      })
      .expect(201)
  })

  it('SA get 2 users with pagination', async () => {
    res = await request(server)
      .get('/sa/users?sortBy=name&sortDirection=asc&pageSize=5')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 5,
      "pagesCount": 1,
      "totalCount": 2,
      "items": [
        {
          "banInfo": {
            "banDate": null,
            "banReason": null,
            "isBanned": false
          },
          "createdAt": createResponseUser_1.body.createdAt,
          "email": "user1@gmail.com",
          "id": createResponseUser_1.body.id,
          "login": "user1"
        },
        {
          "banInfo": {
            "banDate": null,
            "banReason": null,
            "isBanned": false
          },
          "createdAt": createResponseUser_2.body.createdAt,
          "email": "user2@gmail.com",
          "id": createResponseUser_2.body.id,
          "login": "user2"
        }
      ]
    })
  })

  it ('SA ban user', async  () => {
    await request(server)
      .put('/sa/users/' + createResponseUser_1.body.id + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : true,
        banReason : 'test ban for user 1 that longer 20'
      })
      .expect(204)
    res = await request(server)
      .get('/sa/users?sortBy=name&sortDirection=asc&pageSize=1')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 1,
      "pagesCount": 2,
      "totalCount": 2,
      "items": [
        {
          "banInfo": {
            "banDate": expect.any(String),
            "banReason": "test ban for user 1 that longer 20",
            "isBanned": true
          },
          "createdAt": expect.any(String),
          "email": "user1@gmail.com",
          "id": createResponseUser_1.body.id,
          "login": "user1"
        }
      ]
    })
    res = await request(server)
      .get('/sa/users?sortBy=name&sortDirection=asc&pageSize=1&banStatus=banned')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 1,
      "pagesCount": 1,
      "totalCount": 1,
      "items": [
        {
          "banInfo": {
            "banDate": expect.any(String),
            "banReason": "test ban for user 1 that longer 20",
            "isBanned": true
          },
          "createdAt": expect.any(String),
          "email": "user1@gmail.com",
          "id": createResponseUser_1.body.id,
          "login": "user1"
        }
      ]
    })
    await request(server)
      .put('/sa/users/' + createResponseUser_1.body.id + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : false ,
        banReason : 'test ban for user 1 that longer 20'
      })
      .expect(204)
    res = await request(server)
      .get('/sa/users?sortBy=name&sortDirection=asc&pageSize=1')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 1,
      "pagesCount": 2,
      "totalCount": 2,
      "items": [
        {
          "banInfo": {
            "banDate": null,
            "banReason": null,
            "isBanned": false
          },
          "createdAt": expect.any(String),
          "email": "user1@gmail.com",
          "id": createResponseUser_1.body.id,
          "login": "user1"
        }
      ]
    })
  })

  it ('SA delete 1 user', async  () => {
    await request(server)
      .delete('/sa/users/' + createResponseUser_1.body.id)
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
  })

  it('SA check for deleted 1 user', async () => {
    res = await request(server)
      .get('/sa/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 1,
      "totalCount": 1,
      "items": [
        {
          "banInfo": {
            "banDate": null,
            "banReason": null,
            "isBanned": false
          },
          "createdAt": createResponseUser_2.body.createdAt,
          "email": "user2@gmail.com",
          "id": createResponseUser_2.body.id,
          "login": "user2"
        }
      ]
    })
  })

  it ('SA create new blog', async () => {
    createResponseBlog_1 = await request(server)
      .post('/blog')
      .send({
        "name": "TEST2",
        "description": "TEST2",
        "websiteUrl": "http://www.test2.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    res = await request(server)
      .get('/blogs/' + createResponseBlog_1.body.id )
      .expect(200)
    expect(res.body).toStrictEqual({
      "id": createResponseBlog_1.body.id,
      "name": "TEST2",
      "description": "TEST2",
      "websiteUrl": "http://www.test2.com",
      "createdAt": expect.any(String),
      "isMembership": true
    })
  })

  it('SA check for created blog', async () => {
    res = await request(server)
      .get('/sa/blogs')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          name: 'TEST2',
          description: 'TEST2',
          websiteUrl: 'http://www.test2.com',
          id: createResponseBlog_1.body.id,
          createdAt: createResponseBlog_1.body.createdAt,
          isMembership: true,
          blogOwnerInfo: {
            userId : expect.any(String),
            userLogin : expect.any(String)
          }
        }
      ]
    })
  })

  it ('SA bind blog', async  () => {
    await request(server)
      .put('/sa/blogs/' + createResponseBlog_1.body.id + '/bind-with-user/' + createResponseUser_2.body.id)
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
  })

  it('SA check for binded blog', async () => {
    res = await request(server)
      .get('/sa/blogs')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
    expect(res.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          name: 'TEST2',
          description: 'TEST2',
          websiteUrl: 'http://www.test2.com',
          id: createResponseBlog_1.body.id,
          createdAt: createResponseBlog_1.body.createdAt,
          isMembership: true,
          blogOwnerInfo: {
            userId : createResponseUser_2.body.id,
            userLogin : createResponseUser_2.body.login
          }
        }
      ]
    })
  })

  it('BLOGGERS delete created blog', async () => {
    createResponseUser_2 = await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'user2',
        password : 'qwerty'
      })
      .expect(200)
    await request(server)
      .delete('/blogger/blogs/' + createResponseBlog_1.body.id)
      .auth(createResponseUser_2.body.accessToken, {type : 'bearer'})
      .expect(204)
    await request(server)
      .get('/blogs/' + createResponseBlog_1.body.id )
      .expect(404)
  })

  //CHECK BLOGGER

  it('PUBLIC AND BLOGGER delete all data after SA', async () => {
    //runDb()
    await request(server)
      .delete('/testing/all-data')
      .set({ Authorization: "Basic YWRtaW46cXdlcnR5" })
      .expect(204)
  })
  //try to auth with banned user

  it ('AUTH PUBLIC login with banned user', async () => {
    //create user
    await request(server)
      .post('/auth/registration')
      .send({
        login : "userforban",
        email : "userforban@yandex.ru",
        password : "1234567"
      })
      .expect(204)
    //ban user
    let userId = (await service.returnUserByField('userforban')).id
    await request(server)
      .put('/sa/users/' + userId + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : true,
        banReason : 'test ban for user 1 that longer 20'
      })
      .expect(204)
    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'userforban@yandex.ru',
        password : '1234567'
      })
      .expect(401)
    await request(server)
      .put('/sa/users/' + userId + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : false,
        banReason : 'test ban for user 1 that longer 20'
      })
  })

  //starts with create user
  let user
  it('AUTH PUBLIC test email sending', async () => {
    await request(server)
      .post('/auth/registration')
      .send({
        login : "nastya1",
        email : "fateevanastushatest@yandex.ru",
        password : "qwerty1"
      })
      .expect(204)
    await request(server)
      .post('/auth/registration')
      .send({
        login : "",
        email : "",
        password : ""
      })
      .expect(400)
    await request(server)
      .post('/auth/registration')
      .send({
        login : "nastya1",
        email : "fateevanastushatest@yandex.ru",
        password : "qwerty1"
      })
      .expect(400)
    //registration email resending
    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "notexisting@gmail.com"
      })
      .expect(400)

    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "fateevanastushatest@yandex.ru"
      })
      .expect(204)

    //confirmation check
    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : "not existing code"
      })
      .expect(400)
    user = await service.returnUserByField('nastya1')
    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : user.confirmedCode
      })
      .expect(204)
  });

  it('AUTH PUBLIC test change password', async () => {
    await request(server)
      .post('/auth/password-recovery')
      .send({
        email : "fateevanastushatest@yandex.r",
      })
      .expect(400)
    await request(server)
      .post('/auth/password-recovery')
      .send({
        email : "fateevanastushatest@yandex.ru",
      })
      .expect(201)

    await request(server)
      .post('/auth/new-password')
      .send({
        "newPassword": "qwerty11",
        "recoveryCode": 'WRONG CODE'
      })
      .expect(400)
    let new_user = await service.returnUserByField('nastya1')
    await request(server)
      .post('/auth/new-password')
      .send({
        "newPassword": "qwerty11",
        "recoveryCode": new_user.confirmedCode
      })
      .expect(204)

    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'WRONG PASSWORD'
      })
      .expect(401)

    token_1 = await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'qwerty11'
      })
      .expect(200)
    expect(token_1.body).toBeDefined()

  });
  it('AUTH PUBLIC check me and refresh token request', async () => {
    await request(server)
      .get('/auth/me')
      .expect(401)
    res = await request(server)
      .get('/auth/me')
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(200)
    expect(res.body).toStrictEqual({
      email : 'fateevanastushatest@yandex.ru',
      login : 'nastya1',
      userId : expect.any(String)
    })
  })
  //create second user

  it('AUTH PUBLIC create second user for check blogs', async () => {
    await request(server)
      .post('/auth/registration')
      .send({
        login : "alina28",
        email : "alina23tikhomirova@yandex.ru",
        password : "qwerty"
      })
      .expect(204)
    token_2 = await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'alina28',
        password : 'qwerty'
      })
      .expect(200)
    expect(token_2.body).toBeDefined()
  })
  //check for bloggers

  it ('BLOGGER test blogs', async () => {
    createResponseBlog_1 = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "1bloguser1",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    expect(createResponseBlog_1.body).toStrictEqual({
      "name": "1bloguser1",
      "description": "about me",
      "websiteUrl": "http://www.nastyastar.com",
      'id' : expect.any(String),
      "createdAt" : expect.any(String),
      'isMemberShip' : false
    })
    await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "2bloguser1",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    createResponseBlog_2 = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "2bloguser2",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(201)
    res = await request(server)
      .get('/blogger/blogs')
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 0,
      "totalCount": 0,
      "items": [{
        "createdAt": expect.any(String),
        "description": "about me",
        "id": expect.any(String),
        "isMembership": false,
        "name": "2bloguser1",
        "websiteUrl": "http://www.nastyastar.com"
      },
        {
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "1bloguser1",
          "websiteUrl": "http://www.nastyastar.com"
        }]
    })
    await request(server)
      .put('/blogger/blogs/' + createResponseBlog_1.body.id )
      .send({
        "name": "updatedname",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(403)
    res = await request(server)
      .get('/blogger/blogs')
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 0,
      "totalCount": 0,
      "items": [{
        "createdAt": expect.any(String),
        "description": "about me",
        "id": expect.any(String),
        "isMembership": false,
        "name": "2bloguser1",
        "websiteUrl": "http://www.nastyastar.com"
      },
        {
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "1bloguser1",
          "websiteUrl": "http://www.nastyastar.com"
        }]
    })
    await request(server)
      .put('/blogger/blogs/' + createResponseBlog_1.body.id )
      .send({
        "name": "updatedname",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(204)
    res = await request(server)
      .get('/blogger/blogs')
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 0,
      "totalCount": 0,
      "items": [{
        "createdAt": expect.any(String),
        "description": "about me",
        "id": expect.any(String),
        "isMembership": false,
        "name": "2bloguser1",
        "websiteUrl": "http://www.nastyastar.com"
      },
        {
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "updatedname",
          "websiteUrl": "http://www.nastyastar.com"
        }]
    })
  })
  it('PUBLIC get all blogs', async () => {
    res = await request(server)
      .get('/blogs')
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 1,
      "totalCount": 3,
      "items": [
        {
          "blogOwnerInfo": {
            "userId": expect.any(String),
            "userLogin": "alina28"
          },
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "2bloguser2",
          "websiteUrl": "http://www.nastyastar.com"
        },
        {
          "blogOwnerInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "2bloguser1",
          "websiteUrl": "http://www.nastyastar.com"
        },
        {
          "blogOwnerInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "createdAt": expect.any(String),
          "description": "about me",
          "id": expect.any(String),
          "isMembership": false,
          "name": "updatedname",
          "websiteUrl": "http://www.nastyastar.com"
        }
      ]
    })
  })

  //test for posts

  it ('BLOGGER test posts', async () => {
    await request(server)
      .post('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(403)
    createResponsePost_1 = await request(server)
      .post('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    await request(server)
      .post('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts')
      .send({
        "title": "string2",
        "shortDescription": "string2",
        "content": "string2"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    await request(server)
      .post('/blogger/blogs/' + createResponseBlog_2.body.id + '/posts')
      .send({
        "title": "string3",
        "shortDescription": "string3",
        "content": "string3"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(201)
    //update post
    res = await request(server)
      .put('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts/' + createResponsePost_1.body.id)
      .send({
        "title": "updated",
        "shortDescription": "updated",
        "content": "updated"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(204)
    res = await request(server)
      .get('/blogs/' + createResponseBlog_1.body.id + '/posts')
      .expect(200)
    expect(res.body).toStrictEqual({
      "page": 1,
      "pageSize": 10,
      "pagesCount": 1,
      "totalCount": 2,
      "items": [
        {
          "blogId": expect.any(String),
          "blogName": "updatedname",
          "content": "string2",
          "createdAt": expect.any(String),
          "extendedLikesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None",
            "newestLikes": []
          },
          "id": expect.any(String),
          "shortDescription": "string2",
          "title": "string2"
        },
        {
          "blogId": expect.any(String),
          "blogName": "updatedname",
          "content": "updated",
          "createdAt": expect.any(String),
          "extendedLikesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None",
            "newestLikes": []
          },
          "id": expect.any(String),
          "shortDescription": "updated",
          "title": "updated"
        }
      ]
    })
    res = await request(server)
      .put('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts/' + createResponsePost_1.body.id)
      .send({
        "title": "updated2",
        "shortDescription": "updated2",
        "content": "updated2"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(403)
  })

  it("PUBLIC COMMENTS check for likes", async () => {
    createResponseComment_1 = await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : '1 comment content for posts 1'
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)

    res = await request(server)
      .get('/comments/' + createResponseComment_1.body.id)
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(200)
    expect(res.body).toStrictEqual({
      "commentatorInfo": {
        "userId": expect.any(String),
        "userLogin": "nastya1"
      },
      "content": "1 comment content for posts 1",
      "createdAt": expect.any(String),
      "id": createResponseComment_1.body.id,
      "likesInfo": {
        "dislikesCount": 0,
        "likesCount": 0,
        "myStatus": "None"
      }
    })
    await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : '2 comment content for posts 1'
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : '2 comment content for posts 1'
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : '3 comment content for posts 1'
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(201)
    res = await request(server)
      .get('/posts/' + createResponsePost_1.body.id + '/comments')
      .expect(200)
    expect(res.body).toStrictEqual({
      "items": [
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "alina28"
          },
          "content": "3 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "2 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "2 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "1 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        }
      ],
      "page": 1,
      "pageSize": 10,
      "pagesCount": 1,
      "totalCount": 4
    })
  });

  it('timer ', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Таймер на 10 секунд
  });

  it('COMMENTS PUBLIC check', async () => {
    await request(server)
      .post('/auth/registration')
      .send({
        login : "userthat",
        email : "userd@yandex.ru",
        password : "1234567"
      })
      .expect(204)
    tokenOfBannedUser = await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'userd@yandex.ru',
        password : '1234567'
      })
      .expect(200)
    createResponseComment_1 = await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : 'comment of banned user that not available to see'
      })
      .auth(tokenOfBannedUser.body.accessToken, {type : 'bearer'})
      .expect(201)
    //ban user
    res = await request(server)
      .get('/comments/' + createResponseComment_1.body.id)
      .expect(200)
    expect(res.body).toStrictEqual({
      "commentatorInfo": {
        "userId": expect.any(String),
        "userLogin": "userthat"
      },
      "content": "comment of banned user that not available to see",
      "createdAt": expect.any(String),
      "id": expect.any(String),
      "likesInfo": {
        "dislikesCount": 0,
        "likesCount": 0,
        "myStatus": "None"
      }
    })
    createResponsePost_2 = await request(server)
      .post('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts')
      .send({
        "title": "string1",
        "shortDescription": "string1",
        "content": "string1"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
    createResponseComment_2 = await request(server)
      .post('/posts/' + createResponsePost_1.body.id + '/comments')
      .send({
        content  : 'comment to check likes'
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(201)
    //set like for another comment
    await request(server)
      .put('/comments/' + createResponseComment_2.body.id + '/like-status')
      .send({
        "likeStatus": "Like"
      })
      .auth(tokenOfBannedUser.body.accessToken, {type : 'bearer'})
      .expect(204)
    await request(server)
      .put('/comments/' + createResponseComment_2.body.id + '/like-status')
      .send({
        "likeStatus": "Dislike"
      })
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(204)
    await request(server)
      .put('/comments/' + createResponseComment_2.body.id + '/like-status')
      .send({
        "likeStatus": "Like"
      })
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(204)
    let userId = (await service.returnUserByField('userthat')).id
    await request(server)
      .put('/sa/users/' + userId + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : true,
        banReason : 'test ban for user 1 that longer 20'
      })
      .expect(204)
    await request(server)
      .get('/comments/' + createResponseComment_1)
      .expect(404)
    res = await request(server)
      .get('/posts/' + createResponsePost_1.body.id + '/comments')
      .expect(200)
    expect(res.body).toStrictEqual({
      "items": [
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "comment to check likes",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 1,
            "likesCount": 1,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "alina28"
          },
          "content": "3 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "2 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "2 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        },
        {
          "commentatorInfo": {
            "userId": expect.any(String),
            "userLogin": "nastya1"
          },
          "content": "1 comment content for posts 1",
          "createdAt": expect.any(String),
          "id": expect.any(String),
          "likesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None"
          }
        }
      ],
      "page": 1,
      "pageSize": 10,
      "pagesCount": 1,
      "totalCount": 5
    })
    await request(server)
      .put('/sa/users/' + userId + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : false,
        banReason : 'test ban for user 1 that longer 20'
      })
    res = await request(server)
      .get('/comments/' + createResponseComment_2.body.id)
      .expect(200)
    expect(res.body).toStrictEqual({
      "commentatorInfo": {
        "userId": expect.any(String),
        "userLogin": "nastya1"
      },
      "content": "comment to check likes",
      "createdAt": expect.any(String),
      "id": expect.any(String),
      "likesInfo": {
        "dislikesCount": 1,
        "likesCount": 2,
        "myStatus": "None"
      }
    })
  })

  it("BLOGGERS AND PUBLIC BLOGS AND POSTS check for deleting blogs and posts ", async () => {
    await request(server)
      .delete('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts/' + createResponsePost_1.body.id)
      .auth(token_2.body.accessToken, {type : 'bearer'})
      .expect(403)
    await request(server)
      .get('/posts/' + createResponsePost_1.body.id)
      .expect(200)
    await request(server)
      .delete('/blogger/blogs/' + createResponseBlog_1.body.id + '/posts/' + createResponsePost_1.body.id)
      .auth(token_1.body.accessToken, {type : 'bearer'})
      .expect(204)
    await request(server)
      .get('/posts/' + createResponsePost_1.body.id)
      .expect(404)
  });


  afterAll(async () => {
    await request(server)
      .delete('/testing/all-data')
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
    await server.close()
  })
});
