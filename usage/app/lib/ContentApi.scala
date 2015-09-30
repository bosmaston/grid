package lib

import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.buildinfo.CapiBuildInfo

import scala.concurrent.{ExecutionContext, Future}

import com.ning.http.client.Realm.{RealmBuilder, AuthScheme}
import com.ning.http.client.{AsyncHttpClientConfig, AsyncHttpClient}
import com.ning.http.client.AsyncHttpClientConfig.Builder

import dispatch.Http


object PreviewContentApi extends ContentApiRequestBuilder {
  override val targetUrl = Config.properties("capi.preview.url")

  val realm = new RealmBuilder()
    .setPrincipal(Config.properties("capi.preview.user"))
    .setPassword(Config.properties("capi.preview.password"))
    .setUsePreemptiveAuth(true)
    .setScheme(AuthScheme.BASIC)
    .build();

  val previewBuilder = builder.setRealm(realm)

  override val client = new AsyncHttpClient(previewBuilder.build)
}

object LiveContentApi extends ContentApiRequestBuilder {
  override val targetUrl = Config.properties("capi.live.url")
}

class ContentApiRequestBuilder extends GuardianContentClient(apiKey = Config.properties("capi.apiKey")) {
  val userAgent = "content-api-scala-client/"+CapiBuildInfo.version

  val builder = new Builder()
    .setAllowPoolingConnections(true)
    .setMaxConnectionsPerHost(10)
    .setMaxConnections(10)
    .setConnectTimeout(1000)
    .setRequestTimeout(8000)
    .setCompressionEnforced(true)
    .setFollowRedirect(true)
    .setUserAgent(userAgent)
    .setConnectionTTL(60000)

  val client = new AsyncHttpClient(builder.build)

  override lazy val http = Http(client)
}

