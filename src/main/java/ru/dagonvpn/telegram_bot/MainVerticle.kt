package ru.dagonvpn.telegram_bot

import io.vertx.core.AbstractVerticle
import io.vertx.core.AsyncResult
import io.vertx.core.Promise
import io.vertx.core.http.HttpServer
import io.vertx.ext.web.Router

class MainVerticle : AbstractVerticle() {
  @Throws(Exception::class)
  override fun start(startPromise: Promise<Void>) {
    val server = vertx.createHttpServer()
    val router = Router.router(vertx)
    router["/"].handler {

    }
    server.requestHandler(router).listen(8888) { http: AsyncResult<HttpServer?> ->
      if (http.succeeded()) {
        startPromise.complete()
        println("HTTP server started on port 8888")
      } else {
        startPromise.fail(http.cause())
      }
    }
  }
}
