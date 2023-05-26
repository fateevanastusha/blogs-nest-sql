import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  blogDescriptionString,
  blogFilterString01,
  blogFilterString02,
  blogFilterString03,
  blogFilterString04,
  blogFilterString05,
  blogWebsiteUrlString,
  postContentString,
  postDescriptionString,
  postFilterString01,
  postFilterString02,
  postFilterString03,
  postFilterString04,
  postFilterString05,
} from "../src/test.utils/test.strings";
import { createApp } from "./create.app";
import { MailBoxImap } from "./imap.service";

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
  //CHECK FOR EMPTY BLOG DATA BASE
  it ('GET EMPTY BLOG DATA BASE', async  () => {
    const res = await request(server).get('/blogger/blogs')
    expect(res.body).toStrictEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
  })

  let token : any = null
  let token2 : any = null
  let createResponseBlog : any = null
  let createResponseBlog2 : any = null
  let createResponseUser : any = null
  let res = null

  //create user to test blogs

  it ('SUCCESSFULLY CREATE NEW USER', async  () => {
    createResponseUser = await request(server)
      .post('/users')
      .send({
        login : "admin",
        password : "qwerty",
        email: "admin@gmail.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  it('SUCCESSFULLY AUTH', async () => {
    token = await request(server)
      .post('/auth/login')
      .send(
        {
          loginOrEmail : "admin",
          password : "qwerty"
        }
      )
      .expect(200)

  })

  it ('SUCCESSFULLY CREATE NEW USER', async  () => {
    createResponseUser = await request(server)
      .post('/users')
      .send({
        login : "admin2",
        password : "qwerty",
        email: "admin@gmail.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  it('SUCCESSFULLY AUTH', async () => {
    token2 = await request(server)
      .post('/auth/login')
      .send(
        {
          loginOrEmail : "admin2",
          password : "qwerty"
        }
      )
      .expect(200)

  })

  //CREATE NEW BLOG

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    createResponseBlog = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "Nastya",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(201)
  })

  //GET CREATED BLOG

  it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog.body.id)
    expect(blog.body).toStrictEqual({
      "id": expect.any(String),
      "name": "Nastya",
      "description": "about me",
      "websiteUrl": "http://www.nastyastar.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  //PUT CREATED BLOG

  it ('SUCCESSFULLY UPDATE CREATED BLOG', async  () => {
    request(server)
      .put( "/blogger/blogs/" + createResponseBlog.body.id)
      .send({
        name : "Not Nastya",
        description : "Not about me",
        websiteUrl : "http://www.nastyakoshka.com",
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(200)
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog.body.id)
      .expect(200)
    expect(blog.body).toStrictEqual({
      "id": createResponseBlog.body.id,
      "name" : "Not Nastya",
      "description" : "Not about me",
      "websiteUrl" : "http://www.nastyakoshka.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  //CREATE NEW POST

  it('SUCCESSFULLY CREATE NEW POST BY BLOG ID', async () => {
    await request(server)
      .post('/blogger/blogs/' + createResponseBlog.body.id + '/posts')
      .send({
        "title": "Black Sea",
        "shortDescription": "about sea",
        "content": "black sea is hot"
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(201)
  })

  //GET POSTS WITH PAGINATION

  it ('GET POSTS BY BLOG ID WITH PAGINATION', async  () => {
    const posts = await request(server)
      .get('/blogger/blogs/' + createResponseBlog.body.id + '/posts')
    expect(posts.body).toStrictEqual( {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          "title": "Black Sea",
          "shortDescription": "about sea",
          "content": "black sea is hot",
          "createdAt" : expect.any(String),
          "blogId" : createResponseBlog.body.id,
          "blogName" : "Nastya",
          "id" : expect.any(String),
          "extendedLikesInfo": {
              "dislikesCount": 0,
              "likesCount": 0,
              "myStatus": "None",
              "newestLikes": [],
             },
        }
      ]
    })
  })

  //DELETE CREATED BLOG WITH NO AUTH

  it ('UNSUCCESSFULLY DELETE CREATED BLOG', async  () => {
    await request(server)
      .delete( "/blogger/blogs/" + createResponseBlog.body.id)
      .expect(401)
  })

  //DELETE NOT EXISTING BLOG

  it ('UNSUCCESSFULLY DELETE NOT EXISTING BLOG', async  () => {
    await request(server)
      .delete( "/blogger/blogs/gslgl1323gd")
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(404)
  })

  it ('UNSUCCESSFULLY DELETE CREATED BLOG WITH ANOTHER USER', async  () => {
    await request(server)
      .delete( "/blogger/blogs/" + createResponseBlog.body.id)
      .set("Authorization", "bearer " +  token2.body.accessToken)
      .expect(403)
  })

  //SUCCESSFULLY DELETE CREATED BLOG

  it ('SUCCESSFULLY DELETE CREATED BLOG', async  () => {
    await request(server)
      .delete( "/blogger/blogs/" + createResponseBlog.body.id)
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(204)
  })

  //CREATE 5 NEW BLOGS

  it("SUCCESSFULLY CREATE 5 BLOGS", async () => {
      await request(server)
        .post('/blogger/blogs')
        .send({
          "name": blogFilterString01,
          "description": blogDescriptionString,
          "websiteUrl": blogWebsiteUrlString
        })
        .set("Authorization", "bearer " +  token.body.accessToken)
        .expect(201)
      await request(server)
        .post('/blogger/blogs')
        .send({
          "name": blogFilterString02,
          "description": blogDescriptionString,
          "websiteUrl": blogWebsiteUrlString
        })
        .set("Authorization", "bearer " +  token.body.accessToken)
        .expect(201)
      await request(server)
        .post('/blogger/blogs')
        .send({
          "name": blogFilterString03,
          "description": blogDescriptionString,
          "websiteUrl": blogWebsiteUrlString
        })
        .set("Authorization", "bearer " +  token.body.accessToken)
        .expect(201)
      await request(server)
        .post('/blogger/blogs')
        .send({
          "name": blogFilterString04,
          "description": blogDescriptionString,
          "websiteUrl": blogWebsiteUrlString
        })
        .set("Authorization", "bearer " +  token.body.accessToken)
        .expect(201)
      let lastBlogResponse = await request(server)
        .post('/blogger/blogs')
        .send({
          "name": blogFilterString05,
          "description": blogDescriptionString,
          "websiteUrl": blogWebsiteUrlString
        })
        .set("Authorization", "bearer " +  token.body.accessToken)
        .expect(201)
    expect(lastBlogResponse.status).toBe(201);
  })

  //CHECK BLOGS WITH SEARCH NAME TERM

  it ("CHECK BLOGS FOR PAGINATION WITH SEARCH NAME TERM", async () => {
    const blog = await request(server)
      .get( "/blogger/blogs?searchNameTerm=Citronner")
    expect(blog.body.items[0].name).toEqual("Citronner")
  })

  //CHECK BLOGS WITH SORT BY NAME

  it ("CHECK BLOGS FOR PAGINATION WITH SORT BY NAME", async () => {
    createResponseBlog = await request(server)
      .get( "/blogger/blogs?sortBy=name&sortDirection=asc&pageSize=5&searchNameTerm=ana")
      .set("Authorization", "bearer " +  token.body.accessToken)
    expect(createResponseBlog.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 5,
      totalCount: 3,
      items: [
        {
          "id": expect.any(String),
          "name" : "Ananas",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Banana",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Danam",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        }
      ]
    })
  })

  it ("CHECK FOR NOT BLOGS", async () => {
    createResponseBlog = await request(server)
      .get( "/blogger/blogs")
      .set("Authorization", "bearer " +  token2.body.accessToken)
    expect(createResponseBlog.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
  })

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    createResponseBlog = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "TEST2",
        "description": "TEST2",
        "websiteUrl": "http://www.test2.com"
      })
      .set("Authorization", "bearer " +  token2.body.accessToken)
      .expect(201)
  })

  //GET CREATED BLOG

  it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog2.body.id)
    expect(blog.body).toStrictEqual({
      "id": expect.any(String),
      "name": "TEST2",
      "description": "TEST2",
      "websiteUrl": "http://www.test2.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  it ("CHECK FOR BLOGS", async () => {
    createResponseBlog = await request(server)
      .get( "/blogger/blogs")
      .set("Authorization", "bearer " +  token2.body.accessToken)
    expect(createResponseBlog.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [{
        "id": expect.any(String),
        "name": "TEST2",
        "description": "TEST2",
        "websiteUrl": "http://www.test2.com",
        "createdAt" : expect.any(String),
        "isMembership" : false
      }]
    })
  })

  it ("CHECK BLOGS FOR PAGINATION WITH SORT BY NAME", async () => {
    createResponseBlog = await request(server)
      .get( "/blogger/blogs")
      .set("Authorization", "bearer " +  token.body.accessToken)
    expect(createResponseBlog.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 4,
      items: [
        {
          "id": expect.any(String),
          "name" : "Ananas",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Banana",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Danam",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name": "TEST2",
          "description": "TEST2",
          "websiteUrl": "http://www.test2.com",
          "createdAt" : expect.any(String),
          "isMembership" : false
        }
      ]
    })
  })

  it ('SUCCESSFULLY UPDATE CREATED BLOGS', async  () => {
    request(server)
      .put( "/blogger/blogs/" + createResponseBlog.body.items[0].id)
      .send({
        "name" : "Ananastasia",
        "description" : 'Updated string',
        "websiteUrl" : 'Updated url',
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(200)
    request(server)
      .put( "/blogs/" + createResponseBlog.body.items[1].id)
      .send({
        "name" : "Bananastasia",
        "description" : 'Updated string',
        "websiteUrl" : 'Updated url',
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(200)
    createResponseBlog = await request(server)
      .get( "/blogger/blogs?sortBy=name&sortDirection=asc&pageSize=5&searchNameTerm=ana")
    expect(createResponseBlog.body).toStrictEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 5,
      totalCount: 3,
      items: [
        {
          "id": expect.any(String),
          "name" : "Ananastasia",
          "description" : 'Updated string',
          "websiteUrl" : 'Updated url',
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Bananastasia",
          "description" : 'Updated string',
          "websiteUrl" : 'Updated url',
          "createdAt" : expect.any(String),
          "isMembership" : false
        },
        {
          "id": expect.any(String),
          "name" : "Danam",
          "description" : expect.any(String),
          "websiteUrl" : expect.any(String),
          "createdAt" : expect.any(String),
          "isMembership" : false
        }
      ]
    })
  })


  it ('CREATE BLOG AND BING IT TO DELETE USER DEPENDENCY ', async () => {
    createResponseBlog = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "ADMIN BLOG",
        "description": "ADMIN BLOG",
        "websiteUrl": "http://www.adminblog.com"
      })
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(201)
    await request(server)
      .put('/blogs/' + 'WRONGID' + '/bind-with-user/' + createResponseUser.body.id)
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(400)
    await request(server)
      .put('/blogs/' + createResponseBlog.body.id + '/bind-with-user/' + createResponseUser.body.id)
      .expect(401)
    await request(server)
      .put('/blogs/' + createResponseBlog.body.id + '/bind-with-user/' + createResponseUser.body.id)
      .set("Authorization", "bearer " +  token.body.accessToken)
      .expect(204)
  })

  //GET CREATED BLOG

  it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog.body.id)
    expect(blog.body).toStrictEqual({
      "id": expect.any(String),
      "name": "ADMIN BLOG",
      "description": "ADMIN BLOG",
      "websiteUrl": "http://www.adminblog.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  it('DELETE ALL DATA TO CHECK POSTS', async () => {
    await request(server)
      .delete('/testing/all-data')
      .expect(204)
  })

  it ('GET EMPTY POST DATA BASE', async  () => {
    const res = await request(server).get('/posts')
    expect(res.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
  })

  let blogId : any = null

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    blogId = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "Nastya",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
    expect(blogId.body).toStrictEqual({
      "id": expect.any(String),
      "name": "Nastya",
      "description": "about me",
      "websiteUrl": "http://www.nastyastar.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  //UNSUCCESSFULLY CREATE NEW POST WITH NO AUTH

  it ('UNSUCCESSFULLY CREATE NEW POST WITH NO AUTH', async () => {
    await request(server)
      .post('/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": blogId.body.id
      })
      .expect(401)
  })

  //UNSUCCESSFULLY CREATE NEW POST WITH BAD DATA

  it ('UNSUCCESSFULLY CREATE NEW POST WITH BAD DATA', async () => {
    await request(server)
      .post('/posts')
      .send({
        "title": "",
        "shortDescription": "",
        "content": "",
        "blogId": ""
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(400)
  })

  //UNSUCCESSFULLY CREATE NEW POST WITH WRONG DATA

  it ('UNSUCCESSFULLY CREATE NEW POST WITH WRONG DATA', async () => {
    await request(server)
      .post('/posts')
      .send({
        "title": "",
        "shortDescription": "",
        "content": "string",
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(400)
  })

  //SUCCESSFULLY CREATE NEW POST

  let createResponsePost : any = null

  it ('SUCCESSFULLY CREATE NEW POST', async () => {
    createResponsePost = await request(server)
      .post('/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //CHECK FOR CREATED POST

  it ('SUCCESSFULLY GET CREATED POST', async () => {
    const post = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(post.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": blogId.body.id,
      "blogName" : blogId.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
           "dislikesCount": 0,
             "likesCount": 0,
             "myStatus": "None",
             "newestLikes": [],
      }
    })
  })

  //SUCCESSFULLY UPDATE CREATED POST

  it ('SUCCESSFULLY UPDATE CREATED POST', async () => {
    const req = await request(server)
      .put("/posts/" + createResponsePost.body.id)
      .send({
        "title": "updated string",
        "shortDescription": "updated string",
        "content": "updated string",
        "blogId" : blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
    expect(req.statusCode).toBe(204)
  })

  it ('SUCCESSFULLY GET UPDATED POST', async () => {
    const post = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(post.body).toStrictEqual({
      "id" : expect.any(String),
      "title": "updated string",
      "shortDescription": "updated string",
      "content": "updated string",
      "blogId": blogId.body.id,
      "blogName" : blogId.body.name,
      "createdAt" : expect.any(String)
    })
  })

  it ('UNSUCCESSFULLY GET NOT EXISTING POST', async () => {
    await request(server)
      .get('/posts/notexistingid')
      .expect(404)
  })

  it ('UNSUCCESSFULLY DELETE POST WITH NO AUTH', async () => {
    await request(server)
      .delete('/posts/' + createResponsePost.body.id)
      .expect(401)
  })

  it ('SUCCESSFULLY DELETE POST', async () => {
    await request(server)
      .delete('/posts/' + createResponsePost.body.id)
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
  })

  it ('UNSUCCESSFULLY DELETE NOT EXISTING POST', async () => {
    await request(server)
      .delete('/posts/notexistingid')
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(404)
  })

  it("SUCCESSFULLY CREATE 5 POSTS", async () => {
    await request(server)
      .post('/posts')
      .send({
        "title": postFilterString01,
        "shortDescription": postDescriptionString,
        "content": postContentString,
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    await request(server)
      .post('/posts')
      .send({
        "title": postFilterString02,
        "shortDescription": postDescriptionString,
        "content": postContentString,
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    await request(server)
      .post('/posts')
      .send({
        "title": postFilterString03,
        "shortDescription": postDescriptionString,
        "content": postContentString,
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    await request(server)
      .post('/posts')
      .send({
        "title": postFilterString04,
        "shortDescription": postDescriptionString,
        "content": postContentString,
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    await request(server)
      .post('/posts')
      .send({
        "title": postFilterString05,
        "shortDescription": postDescriptionString,
        "content": postContentString,
        "blogId": blogId.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)

  })

  it ("CHECK POSTS FOR PAGINATION WITH SORT BY NAME", async () => {
    const post = await request(server)
      .get( "/posts?sortBy=title&sortDirection=asc&pageSize=3&pageNumber=1")
    expect(post.body).toStrictEqual({
      pagesCount: 2,
      page: 1,
      pageSize: 3,
      totalCount: 5,
      items: [
        {
          "id" : expect.any(String),
          "title": "Anastasia",
          "shortDescription": "Test description",
          "content": "Test content",
          "blogId": blogId.body.id,
          "blogName" : blogId.body.name,
          "createdAt" : expect.any(String),
          "extendedLikesInfo": {
                "dislikesCount": 0,
               "likesCount": 0,
               "myStatus": "None",
               "newestLikes": [],
          }
        },
        {
          "id" : expect.any(String),
          "title": "Banastasia",
          "shortDescription": "Test description",
          "content": "Test content",
          "blogId": blogId.body.id,
          "blogName" : blogId.body.name,
          "createdAt" : expect.any(String),
          "extendedLikesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None",
            "newestLikes": [],
          }
        },
        {
          "id" : expect.any(String),
          "title": "Cbanastasia",
          "shortDescription": "Test description",
          "content": "Test content",
          "blogId": blogId.body.id,
          "blogName" : blogId.body.name,
          "createdAt" : expect.any(String),
          "extendedLikesInfo": {
            "dislikesCount": 0,
            "likesCount": 0,
            "myStatus": "None",
            "newestLikes": [],
          }
        },

      ]
    })
  })

  it('DELETE ALL DATA', async () => {
    await request(server)
      .delete('/testing/all-data')
      .expect(204)
  })

  it ('SUCCESSFULLY CREATE NEW USER', async  () => {
    createResponseUser = await request(server)
      .post('/users')
      .send({
        login : "nastya",
        password : "qwerty",
        email: "anastasiafateeva2406@gmail.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  it ('SUCCESSFULLY CHECK FOR CREATED NEW USER WITH PAGINATION', async () => {
    const users = await request(server)
      .get('/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
    expect(users.body).toStrictEqual(
      {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id : createResponseUser.body.id,
            login : "nastya",
            email: "anastasiafateeva2406@gmail.com",
            createdAt: expect.any(String),
          }
        ]
      }
    )

  })

  //CREATE NEW BLOG

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    createResponseBlog = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "Nastya",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //GET CREATED BLOG

  it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog.body.id)
    expect(blog.body).toEqual({
      "id": expect.any(String),
      "name": "Nastya",
      "description": "about me",
      "websiteUrl": "http://www.nastyastar.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  it ('SUCCESSFULLY CREATE NEW POST', async () => {
    createResponsePost = await request(server)
      .post('/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": createResponseBlog.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //CHECK FOR CREATED POST

  it ('SUCCESSFULLY GET CREATED POST', async () => {
    const post = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(post.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
        "dislikesCount": 0,
        "likesCount": 0,
        "myStatus": "None",
        "newestLikes" : []
      }
    })
  })


  //SUCCESSFULLY AUTH

  it('SUCCESSFULLY AUTH', async () => {
    token = await request(server)
      .post('/auth/login')
      .send(
        {
          loginOrEmail : "nastya",
          password : "qwerty"
        }
      )
      .expect(200)

  })

  //set dislike to post and check dislike

  it ('SET DISLIKE', async () => {
    await request(server)
      .put('/posts/' + createResponsePost.body.id + '/like-status')
      .set("Authorization", "bearer " +  token.body.accessToken)
      .send(
        {
          "likeStatus": "Dislike"
        }
      )
      .expect(204)
    res = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(res.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
        "dislikesCount": 1,
        "likesCount": 0,
        "myStatus": "None",
        "newestLikes" : []
      }
    })

  })

  //set like to post and check like

  it ('SET LIKE', async () => {
    await request(server)
      .put('/posts/' + createResponsePost.body.id + '/like-status')
      .set("Authorization", "bearer " +  token.body.accessToken)
      .send(
        {
          "likeStatus": "Like"
        }
      )
      .expect(204)
    res = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(res.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
        "dislikesCount": 0,
        "likesCount": 1,
        "myStatus": "None",
        "newestLikes" : [
          {
            addedAt : expect.any(String),
            userId : createResponseUser.body.id,
            login : "nastya"
          }
        ]
      }
    })

  })

  it ('check for like', async () => {
    const post = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(post.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
        "dislikesCount": 0,
        "likesCount": 1,
        "myStatus": "None",
        "newestLikes" : [
          {
            addedAt : expect.any(String),
            userId : createResponseUser.body.id,
            login : "nastya"
          }
        ]
      }
    })
  })

  //unsuccessful like request

  it ('UNSUCCESSFUL REQUEST FOR LIKE WITH WRONG DATA', async () => {
    await request(server)
      .put('/posts/' + createResponsePost.body.id + '/like-status')
      .set("Authorization", "bearer " +  token.body.accessToken)
      .send(
        {
          "likeStatus": "not ok"
        }
      )
      .expect(400)

  })

  it ('UNSUCCESSFUL REQUEST FOR LIKE WITH NO AUTH', async () => {
    await request(server)
      .put('/posts/' + createResponsePost.body.id + '/like-status')
      .send(
        {
          "likeStatus": "not ok"
        }
      )
      .expect(401)

  })

  it ('SET LIKE AGAIN. CHECK FOR NOT DOUBLE LIKE FROM ONE USER', async () => {
    await request(server)
      .put('/posts/' + createResponsePost.body.id + '/like-status')
      .set("Authorization", "bearer " +  token.body.accessToken)
      .send(
        {
          "likeStatus": "Like"
        }
      )
      .expect(204)
    res = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(res.body).toStrictEqual({
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String),
      "id" : createResponsePost.body.id,
      "extendedLikesInfo": {
        "dislikesCount": 0,
        "likesCount": 1,
        "myStatus": "None",
        "newestLikes" : [
          {
            addedAt : expect.any(String),
            userId : createResponseUser.body.id,
            login : "nastya"
          }
        ]

      }
    })

  })


  //get all posts and check likes

  it('CHECK ALL POSTS WITH NEWEST LIKES', async () => {
    res = await request(server)
      .get('/posts')
      .expect(200)
    expect(res.body).toStrictEqual({
      "pagesCount": 1,
      "page": 1,
      "pageSize": 10,
      "totalCount": 1,
      "items": [
        {
          "title": "string",
          "shortDescription": "string",
          "content": "string",
          "blogId": createResponseBlog.body.id,
          "blogName" : createResponseBlog.body.name,
          "createdAt" : expect.any(String),
          "id" : createResponsePost.body.id,
          "extendedLikesInfo": {
            "dislikesCount": 0,
            "likesCount": 1,
            "myStatus": "None",
            "newestLikes" : [
              {
                addedAt : expect.any(String),
                userId : createResponseUser.body.id,
                login : createResponseUser.body.login
              }
            ]
          }
        }
      ]
    })
  })
  //create comment
  let createResponseComment : any

  it('CREATE NEW COMMENT', async () => {
    createResponseComment = await request(server)
      .post('/posts/' + createResponsePost.body.id + '/comments')
      .auth(token.body.accessToken, {type : 'bearer'})
      .send({
        content : "content of comment 111111111111"
      })
      .expect(201)
    expect(createResponseComment.body).toStrictEqual({
      commentatorInfo : {
        userId : createResponseUser.body.id,
        userLogin : "nastya"
      },
      content : "content of comment 111111111111",
      createdAt : expect.any(String),
      id : expect.any(String),
      likesInfo : {
        dislikesCount : 0,
        likesCount : 0,
        myStatus : "None"
      }

    })
  })

  //set dislike to comment and check dislike

  it ('SET WRONG STATUS', async () => {
    await request(server)
      .put('/comments/' + createResponseComment.body.id + '/like-status')
      .auth(token.body.accessToken, {type : 'bearer'})
      .send(
        {
          "likeStatus": "WRONG DATA"
        }
      )
      .expect(400)
  })

  //send wrong status

  it ('SET LIKE TO COMMENT', async () => {
    await request(server)
      .put('/comments/' + createResponseComment.body.id + '/like-status')
      .auth(token.body.accessToken, {type : 'bearer'})
      .send(
        {
          "likeStatus": "Like"
        }
      )
      .expect(204)
    res = await request(server)
      .get('/comments/' + createResponseComment.body.id)
      .auth(token.body.accessToken, {type : 'bearer'})
    expect(res.body).toStrictEqual({
      commentatorInfo : {
        userId : createResponseUser.body.id,
        userLogin : "nastya"
      },
      content : "content of comment 111111111111",
      createdAt : expect.any(String),
      id : expect.any(String),
      likesInfo : {
        dislikesCount : 0,
        likesCount : 1,
        myStatus : "Like"
      }
    })
  })

  //set like to comment and check like

  it ('SET LIKE TO COMMENT', async () => {
    await request(server)
      .put('/comments/' + createResponseComment.body.id + '/like-status')
      .auth(token.body.accessToken, {type : 'bearer'})
      .send(
        {
          "likeStatus": "Like"
        }
      )
      .expect(204)
    res = await request(server)
      .get('/comments/' + createResponseComment.body.id)
      .set("Authorization", "bearer " +  token.body.accessToken)
    expect(res.body).toStrictEqual({
      commentatorInfo : {
        userId : createResponseUser.body.id,
        userLogin : "nastya"
      },
      content : "content of comment 111111111111",
      createdAt : expect.any(String),
      id : expect.any(String),
      likesInfo : {
        dislikesCount : 0,
        likesCount : 1,
        myStatus : "Like"
      }
    })
  })

  it('CREATE NEW USER AND TRY TO UPDATE COMMENT BY ANOTHER USER', async () => {
    createResponseUser = await request(server)
      .post('/users')
      .send({
        login : "andrey",
        password : "qwerty",
        email: "petrischev.kirill@yandex.ru"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
    await request(server)
      .put('/comments/' + createResponseComment.body.id)
      .send({
        content : 'too little'
      })
      .expect(403)
  })

  //check my status without auth

  it ('CHECK STATUS', async () => {
    res = await request(server)
      .get('/comments/' + createResponseComment.body.id)
    expect(res.body).toStrictEqual({
      commentatorInfo : {
        userId : createResponseUser.body.id,
        userLogin : "nastya"
      },
      content : "content of comment 111111111111",
      createdAt : expect.any(String),
      id : expect.any(String),
      likesInfo : {
        dislikesCount : 0,
        likesCount : 1,
        myStatus : "None"
      }
    })
  })

  it('DELETE ALL DATA TO CHECK SECURITY', async () => {
    await request(server)
      .delete('/testing/all-data')
      .expect(204)
  })

  //SUCCESSFULLY REGISTRATION

  it('TEST EMAIL SENDING', async () => {
    //MAKE REQUEST REGISTRATION
    const resp = await request(server)
      .post('/auth/registration')
      .send({
        login : "nastya1",
        email : "fateevanastushatest@yandex.ru",
        password : "qwerty1"
      })

    //UNSUCCESSFULLY EMAIL RESENDING

    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "notexisting@gmail.com"
      })
      .expect(400)

    //SUCCESSFULLY EMAIL RESENDING

    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "fateevanastushatest@yandex.ru"
      })
      .expect(204)

    const sentMessage = await imapService.waitNewMessage(1)
    const html: string | null = await imapService.getMessageHtml(sentMessage)
    expect(html).toBeDefined()
    const code : string = html!.split("?code=")[1].split("'")[0]

    //NOT EXISTING CODE - EXPECT 400

    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : "not existing code"
      })
      .expect(400)

    //CORRECT CODE - EXPECT 204 AND CONFIRMED ACCOUNT

    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : code
      })
      .expect(204)

  });

  //TRY TO REGISTRATION WITH WRONG DATA

  it('REGISTRATION WITH WRONG DATA', async () => {
    //MAKE REQUEST REGISTRATION
    await request(server)
      .post('/auth/registration')
      .send({
        login : "nastya1",
        email : "fateevanastushatest@yandex.ru",
        password : "qwerty1"
      })
      .expect(400)
    await request(server)
      .post('/auth/registration')
      .send({
        login : "",
        email : "",
        password : ""
      })
      .expect(400)


  });

  //TESTING LOGIN

  it ('TEST LOGIN IN SYSTEM', async  () => {
    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'WRONG PASSWORD'
      })
      .expect(401)
    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'qwerty1'
      })
      .expect(200)
  })

  it('DELETE ALL DATA TO TEST AUTH', async () => {
    await request(server)
      .delete('/testing/all-data')
      .expect(204)
  })

  it ('SUCCESSFULLY CREATE NEW USER', async  () => {
    createResponseUser = await request(server)
      .post('/users')
      .send({
        login : "nastya",
        password : "qwerty",
        email: "anastasiafateeva2406@gmail.com"
      })
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //CHECK FOR CREATED USER

  it ('SUCCESSFULLY CHECK FOR CREATED NEW USER WITH PAGINATION', async () => {
    const users = await request(server)
      .get('/users')
      .set({Authorization: "Basic YWRtaW46cXdlcnR5"})
    expect(users.body).toStrictEqual(
      {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id : createResponseUser.body.id,
            login : "nastya",
            email: "anastasiafateeva2406@gmail.com",
            createdAt: expect.any(String),
            isConfirmed : true
          }
        ]
      }
    )

  })

  //UNSUCCESSFULLY AUTH WITH WRONG PASSWORD

  it('UNSUCCESSFULLY AUTH WITH WRONG PASSWORD', async () => {
    await request(server)
      .post('/auth')
      .send(
        {
          loginOrEmail : "nastya",
          password : "WRONG PASSWORD"
        }
      )
      .expect(404)

  })

  //CREATE NEW BLOG

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    createResponseBlog = await request(server)
      .post('/blogger/blogs')
      .send({
        "name": "Nastya",
        "description": "about me",
        "websiteUrl": "http://www.nastyastar.com"
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //GET CREATED BLOG

  it ('GET SUCCESSFULLY CREATED BLOG', async  () => {
    const blog = await request(server)
      .get( "/blogger/blogs/" + createResponseBlog.body.id)
    expect(blog.body).toStrictEqual({
      "id": expect.any(String),
      "name": "Nastya",
      "description": "about me",
      "websiteUrl": "http://www.nastyastar.com",
      "createdAt" : expect.any(String),
      "isMembership" : false
    })
  })

  it ('SUCCESSFULLY CREATE NEW POST', async () => {
    createResponsePost = await request(server)
      .post('/posts')
      .send({
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": createResponseBlog.body.id
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //CHECK FOR CREATED POST

  it ('SUCCESSFULLY GET CREATED POST', async () => {
    const post = await request(server)
      .get('/posts/' + createResponsePost.body.id)
    expect(post.body).toStrictEqual({
      "id" : createResponsePost.body.id,
      "title": "string",
      "shortDescription": "string",
      "content": "string",
      "blogId": createResponseBlog.body.id,
      "blogName" : createResponseBlog.body.name,
      "createdAt" : expect.any(String)
    })
  })

  //SUCCESSFULLY AUTH

  it('SUCCESSFULLY AUTH', async () => {
    token = await request(server)
      .post('/auth/login')
      .send(
        {
          loginOrEmail : "nastya",
          password : "qwerty"
        }
      )
      .expect(200)

  })

  //GET INFO ABOUT USER

  it('SUCCESSFULLY GET USER INFO', async () => {
    const res = await request(server)
      .get('/auth/me')
      .auth(token.body, {type : 'bearer'})
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual({
      login : "nastya",
      email : "anastasiafateeva2406@gmail.com",
      id: createResponseUser.body.id
    })

  })

  //UNSUCCESSFULLY CREATE NEW COMMENT WITH WRONG TOKEN

  it('UNSUCCESSFULLY CREATE NEW COMMENT WITH WRONG TOKEN', async () => {
    await request(server)
      .post('/posts' + createResponsePost.body.id + '/comment')
      .send({
        content : 'too little'
      })
  })


  //SUCCESSFULLY REGISTRATION

  //MOCK FUNCTION JEST

  it('TEST EMAIL SENDING', async () => {
    //MAKE REQUEST REGISTRATION
    const resp = await request(server)
      .post('/auth/registration')
      .send({
        login : "nastya1",
        email : "fateevanastushatest@yandex.ru",
        password : "qwerty1"
      })

    //UNSUCCESSFULLY EMAIL RESENDING

    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "notexisting@gmail.com"
      })
      .expect(400)

    //SUCCESSFULLY EMAIL RESENDING

    await request(server)
      .post('/auth/registration-email-resending')
      .send({
        email : "fateevanastushatest@yandex.ru"
      })
      .expect(204)

    const sentMessage = await imapService.waitNewMessage(2)
    const html: string | null = await imapService.getMessageHtml(sentMessage)
    expect(html).toBeDefined()
    const code : string = html!.split("?code=")[1].split("'")[0]

    //NOT EXISTING CODE - EXPECT 400

    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : "not existing code"
      })
      .expect(400)

    //CORRECT CODE - EXPECT 204 AND CONFIRMED ACCOUNT

    await request(server)
      .post('/auth/registration-confirmation')
      .send({
        "code" : code
      })
      .expect(204)

  });

  //SUCCESSFULLY CHANGE PASSWORD

  it('TEST PASSWORD RECOVERY', async () => {
    //UNSUCCESSFULLY MAKE REQUEST REGISTRATION
    await request(server)
      .post('/auth/password-recovery')
      .send({
        email : "fateevanastushatest@yandex.r",
      })
      .expect(400)
    //MAKE REQUEST REGISTRATION
    await request(server)
      .post('/auth/password-recovery')
      .send({
        email : "fateevanastushatest@yandex.ru",
      })
      .expect(201)


    const sentMessage = await imapService.waitNewMessage(1)
    const html: string | null = await imapService.getMessageHtml(sentMessage)
    expect(html).toBeDefined()
    const code : string = html!.split("?code=")[1].split("'")[0]

    //NOT EXISTING CODE - EXPECT 400

    await request(server)
      .post('/auth/password-new')
      .send({
        "newPassword": "qwerty11",
        "recoveryCode": code
      })
      .expect(204)

  });

  //TESTING LOGIN

  it ('TEST LOGIN IN SYSTEM', async  () => {
    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'WRONG PASSWORD'
      })
      .expect(401)

    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'WRONG PASSWORD'
      })
      .expect(401)

    await request(server)
      .post('/auth/login')
      .send({
        loginOrEmail : 'fateevanastushatest@yandex.ru',
        password : 'qwerty11'
      })
      .expect(200)


  })

  afterAll(async () => {
    await request(server)
      .delete('/testing/all-data')
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
    await imapService.disconnect()
    await server.close();
  })
});
