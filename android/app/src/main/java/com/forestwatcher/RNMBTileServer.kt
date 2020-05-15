package com.forestwatcher

import android.util.Log
import java.io.BufferedReader
import java.io.ByteArrayOutputStream
import java.io.FileNotFoundException
import java.io.PrintStream
import java.lang.Exception
import java.net.ServerSocket
import java.net.Socket
import kotlin.math.pow

// Defines an interface for running a tile server locally.
public object RNMBTileServer: Runnable {

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
                Log.d(javaClass.simpleName, "request handled start")
                handle(socket)
                socket.close()
                Log.d(javaClass.simpleName, "request handled in while")
            }
        } catch (e: Exception) {
            Log.d(javaClass.simpleName, e.localizedMessage)
        } finally {
            Log.d(javaClass.simpleName, "request handled")
        }
    }

    @Throws
    private fun handle(socket: Socket) {
        var reader: BufferedReader? = null
        var output: PrintStream? = null

        try {
            var route: String? = null
            reader = socket.getInputStream().reader().buffered()

            // Read HTTP headers and parse out the route.
            do {
                val line = reader.readLine() ?: ""
                if (line.startsWith("GET")) {
                    route = line.substringAfter("GET /").substringBefore(".")
                    break
                }
            } while (!line.isEmpty())

            val sourceId = source?.id ?: return

            if (route?.contains(sourceId) == false) {
                return
            }

            // Output stream that we send the response to
            output = PrintStream(socket.getOutputStream())

            // Prepare the content to send.
            if (null == route || null == source) {
                writeServerError(output)
                return
            }

            val bytes = loadContent(source, route) ?: run {
                writeServerError(output)
                return
            }

            // Send out the content.
            output.apply {
                println("HTTP/1.0 200 OK")
                println("Content-Type: " + detectMimeType(source!!.format))
                println("Content-Length: " + bytes.size)
                if (source!!.isVector) println("Content-Encoding: gzip")
                println()
                write(bytes)
                flush()
            }
        } finally {
            if (null != output) output.close()
            reader?.close()
        }
    }

    @Throws
    private fun loadContent(source: RNMBTileSource?, route: String): ByteArray? {
        val tileParams = route.substringAfter("?").split("&")
        // TODO: This is quite nasty - what would be the most kotlin-y way to do this?
        val (z, x, y) = tileParams.map { it.replace(" HTTP/1", "").replace("x=", "").replace("y=", "").replace("z=", "").toInt() }

        try {
            val output = ByteArrayOutputStream()
            val content = source?.getTile(z, x, y) ?: return null
            output.write(content)
            output.flush()
            return output.toByteArray()
        } catch (e: FileNotFoundException) {
            e.printStackTrace()
            return null
        }
    }

    private fun writeServerError(output: PrintStream) {
        output.println("HTTP/1.0 500 Internal Server Error")
        output.flush()
    }

    private fun detectMimeType(format: String?): String? = when (format) {
        "jpg" -> "image/jpeg"
        "png" -> "image/png"
        "mvt" -> "application/x-protobuf"
        "pbf" -> "application/x-protobuf"
        else -> "application/octet-stream"
    }
}