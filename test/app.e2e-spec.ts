import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { blogCreator } from "../src/test.utils/test.functions";
import {
  blogFilterString01,
  blogFilterString02,
  blogFilterString03,
  blogFilterString04, blogFilterString05
} from "../src/test.utils/test.strings";
import { AppController } from "../src/app.controller";
import { BlogsController } from "../src/blogs/blogs.controller";
import { PostsController } from "../src/posts/posts.controller";
import { UsersController } from "../src/users/users.controller";
import { CommentsController } from "../src/comments/comments.controller";
import { AuthController } from "../src/auth/auth.controller";
import { SecurityController } from "../src/security/security.controller";
import { IsUserAlreadyExistConstraint } from "../src/users/users.dto";
import { AppService } from "../src/app.service";
import { BlogsRepository } from "../src/blogs/blogs.repository";
import { BlogsService } from "../src/blogs/blogs.service";
import { QueryRepository } from "../src/helpers/query.repository";
import { PostsService } from "../src/posts/posts.service";
import { PostsRepository } from "../src/posts/posts.repository";
import { UsersService } from "../src/users/users.service";
import { UsersRepository } from "../src/users/users.repository";
import { SecurityRepository } from "../src/security/security.repository";
import { AttemptsRepository } from "../src/attempts/attempts.repository";
import { AuthRepository } from "../src/auth/auth.repository";
import { CommentsService } from "../src/comments/comments.service";
import { CommentsRepository } from "../src/comments/comments.repository";
import { LikesRepository } from "../src/likes/likes.repository";
import { SecurityService } from "../src/security/security.service";
import { LikesHelpers } from "../src/helpers/likes.helper";
import { JwtService } from "../src/jwt.service";
import { AuthService } from "../src/auth/auth.service";
import { AuthGuard } from "../src/auth.guard";
import { LocalStrategy } from "../src/auth/strategies/passport.strategy";
import { BusinessService } from "../src/business.service";

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers : [AppController, BlogsController, PostsController, UsersController, CommentsController, AppController, AuthController, SecurityController],
      providers : [IsUserAlreadyExistConstraint, AppService, BlogsRepository, BlogsService,
        QueryRepository, PostsService, PostsRepository, UsersService, UsersRepository,
        SecurityRepository, AttemptsRepository, AuthRepository, CommentsService, CommentsRepository,
        LikesRepository, SecurityService, UsersRepository, LikesHelpers, JwtService, AuthService,
        AuthGuard, LocalStrategy, BusinessService]
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  beforeAll(async () => {
    //runDb()
    await request(app.getHttpServer())
      .delete('/testing/all-data')
      .set({ Authorization: "Basic YWRtaW46cXdlcnR5" })
      .expect(204)
  })
  //CHECK FOR EMPTY BLOG DATA BASE
  it ('GET EMPTY BLOG DATA BASE', async  () => {
    const res = await request(app).get('/blogs')
    expect(res.body).toStrictEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: []
    })
  })

  let createResponseBlog : any = null

  //CREATE NEW BLOG

  it ('SUCCESSFULLY CREATE NEW BLOG', async () => {
    createResponseBlog = await request(app)
      .post('/blogs')
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
    const blog = await request(app)
      .get( "/blogs/" + createResponseBlog.body.id)
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
    request(app)
      .put( "/blogs/" + createResponseBlog.body.id)
      .send({
        name : "Not Nastya",
        description : "Not about me",
        websiteUrl : "http://www.nastyakoshka.com",
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(200)
  })

  //CHECK FOR UPDATED BLOG

  it ('SUCCESSFULLY UPDATED BLOG', async  () => {
    const blog = await request(app)
      .get( "/blogs/" + createResponseBlog.body.id)
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
    await request(app)
      .post('/blogs/' + createResponseBlog.body.id + '/posts')
      .send({
        "title": "Black Sea",
        "shortDescription": "about sea",
        "content": "black sea is hot"
      })
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(201)
  })

  //GET POSTS WITH PAGINATION

  it ('GET POSTS BY BLOG ID WITH PAGINATION', async  () => {
    const posts = await request(app)
      .get('/blogs/' + createResponseBlog.body.id + '/posts')
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
          "id" : expect.any(String)
        }
      ]
    })
  })

  //DELETE CREATED BLOG WITH NO AUTH

  it ('UNSUCCESSFULLY DELETE CREATED BLOG', async  () => {
    await request(app)
      .delete( "/blogs/" + createResponseBlog.body.id)
      .expect(401)
  })

  //DELETE NOT EXISTING BLOG

  it ('UNSUCCESSFULLY DELETE NOT EXISTING BLOG', async  () => {
    await request(app)
      .delete( "/blogs/gslgl1323gd")
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(404)
  })

  //SUCCESSFULLY DELETE CREATED BLOG

  it ('SUCCESSFULLY DELETE CREATED BLOG', async  () => {
    await request(app)
      .delete( "/blogs/" + createResponseBlog.body.id)
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
  })

  //CREATE 5 NEW BLOGS

  it("SUCCESSFULLY CREATE 5 BLOGS", async () => {
    await blogCreator(undefined, blogFilterString01);
    await blogCreator(undefined, blogFilterString02);
    await blogCreator(undefined, blogFilterString03);
    await blogCreator(undefined, blogFilterString04);
    const lastBlogResponse = await blogCreator(undefined, blogFilterString05);
    expect(lastBlogResponse.status).toBe(201);
  })

  //CHECK BLOGS WITH SEARCH NAME TERM

  it ("CHECK BLOGS FOR PAGINATION WITH SEARCH NAME TERM", async () => {
    const blog = await request(app)
      .get( "/blogs?searchNameTerm=Citronner")
    expect(blog.body.items[0].name).toEqual("Citronner")
  })

  //CHECK BLOGS WITH SORT BY NAME

  it ("CHECK BLOGS FOR PAGINATION WITH SORT BY NAME", async () => {
    const blog = await request(app)
      .get( "/blogs?sortBy=name&sortDirection=asc&pageSize=5&searchNameTerm=ana")
    expect(blog.body).toStrictEqual({
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

  afterAll(async () => {
    await request(app)
      .delete('/testing/all-data')
      .set({Authorization : "Basic YWRtaW46cXdlcnR5"})
      .expect(204)
    await app.close();
  })
});
