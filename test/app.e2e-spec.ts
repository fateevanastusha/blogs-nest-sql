import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { createApp } from "./create.app";
import { MailBoxImap } from "./imap/imap.service";

describe('AppController (e2e)', () => {
  jest.setTimeout(3 * 60 * 1000)
  let appRaw: INestApplication;
  let server;
  const imapService = new MailBoxImap()
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    appRaw = moduleFixture.createNestApplication();
    let app = createApp(appRaw)
    await imapService.connectToMail()
    await app.init();
    server = await app.getHttpServer()
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
  let createResponseBlog_1 : any = null
  let createResponsePost_1 : any = null
  let createResponsePost_2 : any = null
  let createResponseBlog_2 : any = null
  let createResponseUser_1 : any = null
  let createResponseUser_2 : any = null
  let res = null

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
            "banDate": "no info",
            "banReason": "no info",
            "isBanned": false
          },
          "createdAt": createResponseUser_1.body.createdAt,
          "email": "user1@gmail.com",
          "id": createResponseUser_1.body.id,
          "login": "user1"
        },
        {
          "banInfo": {
            "banDate": "no info",
            "banReason": "no info",
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
  })

  it('SA check for ban user 1', async () => {
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
  })

  it ('SA unban user', async  () => {
    await request(server)
      .put('/sa/users/' + createResponseUser_1.body.id + '/ban')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .send({
        isBanned : false ,
        banReason : 'test ban for user 1 that longer 20'
      })
      .expect(204)
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
            "banDate": expect.any(String),
            "banReason": "no info",
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

  afterAll(async () => {
    await request(server)
      .delete('/testing/all-data')
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
    await imapService.disconnect()
    await server.close()
  })
});
