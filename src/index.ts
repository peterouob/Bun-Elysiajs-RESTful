import { Elysia, t } from "elysia";
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'
import { BookDatabase } from "./db";

class Unauthorized extends Error {
  constructor() {
    super('Unauthorized')
  }
}

const app = new Elysia().error({
  'Unauth': Unauthorized
}).onError(({ code, error }) => {
  let status
  switch (true) {
    case code === 'VALIDATION':
      status = 400
      break;
    case code === 'NOT_FOUND':
      status = 404
      break
    case code === 'Unauth':
      status = 403
    default:
      status = 500
      break;
  }

  return new Response(error.toString(), { status: 403 })

})
  .use(cookie())
  .use(jwt({
    name: 'jwt',
    secret: 'supersecret'
  }))
  .use(swagger())
  .decorate('db', new BookDatabase)

app.get("/", ({ db }) => db.getBooks())
app.post("/books", ({ db, body }) => db.addBook(body), {
  body: t.Object({
    name: t.String(),
    author: t.String(),
  })
})
app.put("/books", ({ db, body }) => db.updateBook(body.id, { name: body.name, author: body.author }), {
  body: t.Object({
    id: t.Number(),
    name: t.String(),
    author: t.String(),
  })
})
app.delete("/books/:id", async ({ db, params, jwt, cookie: { auth } }) => {
  const profile = await jwt.verify(auth)
  if (!profile) {
    throw new Unauthorized()
  }
})
app.get("/books/:id", ({ db, params }) => db.getBookByID(parseInt(params.id)))

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
