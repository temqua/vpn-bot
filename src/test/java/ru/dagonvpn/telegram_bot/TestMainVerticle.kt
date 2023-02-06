package ru.dagonvpn.telegram_bot

import io.vertx.ext.unit.TestContext
import io.vertx.ext.unit.junit.RunTestOnContext
import io.vertx.ext.unit.junit.VertxUnitRunner
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(VertxUnitRunner::class)
class TestMainVerticle {
  @Rule
  var rule = RunTestOnContext()

  @Before
  fun deploy_verticle(testContext: TestContext) {
    val vertx = rule.vertx()
    vertx.deployVerticle(MainVerticle(), testContext.asyncAssertSuccess())
  }

  @Test
  @Throws(Throwable::class)
  fun verticle_deployed(testContext: TestContext) {
    val async = testContext.async()
    async.complete()
  }
}
