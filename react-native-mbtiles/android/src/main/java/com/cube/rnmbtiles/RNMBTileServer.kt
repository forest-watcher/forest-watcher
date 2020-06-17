package com.cube.rnmbtiles

import android.net.Uri
import android.util.Log
import fi.iki.elonen.NanoHTTPD
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.OutputStream
import java.io.PrintStream
import java.io.PrintWriter
import java.lang.Exception
import java.net.ServerSocket
import java.net.Socket

// Defines an interface for running a tile server locally.
class RNMBTileServer(
    val source: RNMBTileSource,
    port: Int
): NanoHTTPD(port) {

    override fun serve(session: IHTTPSession): Response {
        Log.d(javaClass.simpleName, "Received request: " + session)
        val route = session.uri

        if (route == null || !route.contains(source.id)) {
            Log.d(javaClass.simpleName, "Unexpected request: ${session}")
            return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not found")
        }

        val x = session.parms["x"] ?: return newFixedLengthResponse(Response.Status.BAD_REQUEST, MIME_PLAINTEXT, "Missing X")
        val y = session.parms["y"] ?: return newFixedLengthResponse(Response.Status.BAD_REQUEST, MIME_PLAINTEXT, "Missing Y")
        val z = session.parms["z"] ?: return newFixedLengthResponse(Response.Status.BAD_REQUEST, MIME_PLAINTEXT, "Missing Z")

        val bytes = try {
            source.getTile(z.toInt(), x.toInt(), y.toInt())
        } catch (ex: RNMBTileSourceException.TileNotFoundException) {
            Log.d(javaClass.simpleName, "tile error: " + ex.message)
            return newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, ex.message)
        } catch (ex: Exception) {
            Log.d(javaClass.simpleName, "generic error: " + ex.message)
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, ex.message)
        }

        val mimeType = detectMimeType(source.format)
        return newFixedLengthResponse(Response.Status.OK, mimeType, ByteArrayInputStream(bytes), bytes.size.toLong())
    }

    private fun detectMimeType(format: String?): String = when (format) {
        "jpg" -> "image/jpeg"
        "png" -> "image/png"
        "mvt" -> "application/x-protobuf"
        "pbf" -> "application/x-protobuf"
        else -> "application/octet-stream"
    }
}
