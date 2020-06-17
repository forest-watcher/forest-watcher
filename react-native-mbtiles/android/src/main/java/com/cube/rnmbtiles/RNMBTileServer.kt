package com.cube.rnmbtiles

import android.net.Uri
import android.util.Log
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.lang.Exception
import java.net.ServerSocket
import java.net.Socket

sealed class RNMBTileServerError : Error() {
    class InvalidQueryParameters : RNMBTileServerError()
}

// Defines an interface for running a tile server locally.
object RNMBTileServer: Runnable {

    // The currently active tile source. This must be set otherwise requests will fail.
    private var source: RNMBTileSource? = null

    // The currently active server.
    private var serverSocket: ServerSocket? = null
    var isRunning = false

    // Generates and stores a basemap source, given a path and identifier.
    fun prepare(basemapId: String, basemapPath: String): RNMBTileMetadata? {
        try {
            source = RNMBTileSource(id = basemapId, filePath = basemapPath)

            return source?.metadata
        } catch (e: Exception) {
            Log.d(javaClass.simpleName, e.localizedMessage)
            return null
        }
    }

    // Starts the server on a given port.
    fun startServer(port: Int) {
        serverSocket = ServerSocket(port)
        isRunning = true
        Thread(this).start()
    }

    // Stops the server.
    fun stopServer() {
        isRunning = false
        serverSocket?.close()
        serverSocket = null
    }

    override fun run() {
        try {
            while (isRunning) {
                val socket = serverSocket?.accept() ?: throw Error()
                Log.d(javaClass.simpleName, "request start")
                handle(socket)
                socket.close()
                Log.d(javaClass.simpleName, "request stop")
            }
        } catch (e: Exception) {
            Log.e(javaClass.simpleName, e.message, e)
        } finally {
            Log.d(javaClass.simpleName, "request handled")
        }
    }

    @Throws
    private fun handle(socket: Socket) {
        socket.getInputStream().reader().use { reader ->
            val lines = reader.readText().split("\n")
            val route: String? = lines.firstOrNull { it.startsWith("GET") }?.substringAfter("GET /")?.substringBefore(" ")

            val sourceId = source?.id ?: return

            if (route == null || !route.contains(sourceId)) {
                Log.d(javaClass.simpleName, "Unexpected request: ${lines}")
                return
            }

            val routeUrl = Uri.parse(route)

            // Output stream that we send the response to
            PrintStream(socket.getOutputStream()).use { stream ->
                // Prepare the content to send.
                if (null == source) {
                    writeServerError(stream)
                    return
                }

                try {
                    val bytes = loadContent(source, routeUrl)
                    // Send out the content.
                    stream.apply {
                        println("HTTP/1.0 200 OK")
                        println("Content-Type: " + detectMimeType(source?.format))
                        println("Content-Length: " + bytes.size)
                        if (source?.isVector == true) println("Content-Encoding: gzip")
                        println()
                        write(bytes)
                        flush()
                    }
                } catch (ex: Exception) {
                    writeServerError(stream)
                    return
                }
            }
        }
    }

    @Throws
    private fun loadContent(source: RNMBTileSource?, route: Uri): ByteArray {
        val z = route.getQueryParameter("z")?.toInt() ?: throw RNMBTileServerError.InvalidQueryParameters()
        val x = route.getQueryParameter("x")?.toInt() ?: throw RNMBTileServerError.InvalidQueryParameters()
        val y = route.getQueryParameter("y")?.toInt() ?: throw RNMBTileServerError.InvalidQueryParameters()

        Log.d(javaClass.simpleName, "tile request " + route)
        val content = source?.getTile(z, x, y)
        val output = ByteArrayOutputStream()
        output.write(content)
        output.flush()

        Log.d(javaClass.simpleName, "tile found " + route)
        return output.toByteArray()
    }

    private fun writeServerError(output: PrintStream) {
        Log.d(javaClass.simpleName, "tile not found")
        output.println("HTTP/1.0 404 File Not Found")
        output.flush()
    }

    private fun detectMimeType(format: String?): String = when (format) {
        "jpg" -> "image/jpeg"
        "png" -> "image/png"
        "mvt" -> "application/x-protobuf"
        "pbf" -> "application/x-protobuf"
        else -> "application/octet-stream"
    }
}
