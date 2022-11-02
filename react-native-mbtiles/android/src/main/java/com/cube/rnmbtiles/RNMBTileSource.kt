package com.cube.rnmbtiles

import android.database.sqlite.SQLiteDatabase
import com.facebook.react.bridge.WritableNativeMap

// Defines metadata for this source object.
// TODO: Pass this up to the JS layer.
data class RNMBTileMetadata(
    var minZoomLevel: Int,
    var maxZoomLevel: Int,
    var isVector: Boolean,
    var tms: Boolean,
    var tileSize: Int,
    var attribution: String?,
    var layersJson: String?
) {

    val mappedMetadata: WritableNativeMap
        get() {
            var nativeMap: WritableNativeMap = WritableNativeMap()
            nativeMap.putInt("minZoomLevel", minZoomLevel)
            nativeMap.putInt("maxZoomLevel", maxZoomLevel)
            nativeMap.putBoolean("isVector", isVector)
            nativeMap.putBoolean("tms", tms)
            nativeMap.putInt("tileSize", tileSize)
            nativeMap.putString("attribution", attribution)
            nativeMap.putString("layersJson", layersJson)

            return nativeMap
        }
}

// Defines various errors that may occur whilst working against this source.
sealed class RNMBTileSourceException : Exception() {
    class CouldNotReadFileException : RNMBTileSourceException()
    class TileNotFoundException : RNMBTileSourceException()
    class UnsupportedFormatException : RNMBTileSourceException()
}

// Defines a MBTileSource object, which is used by the tileserver to query for given tile indexes.
class RNMBTileSource(var id: String, var filePath: String) {

    companion object {
        /// Defines the raster formats the app is supporting
        val VALID_RASTER_FORMATS = listOf("jpg", "png")

        /// Defines the vector formats the app is supporting
        val VALID_VECTOR_FORMATS = listOf("pbf", "mvt")
    }

    // Defines metadata for this source object.
    var metadata: RNMBTileMetadata? = null

    // These two properties are used in the server for constructing response payloads.
    var format: String? = null
    var isVector: Boolean = false

    // Defines a connection to the mbtiles database.
    // TODO: Refactor this to use a non-deprecated database dependency.
    private val database: SQLiteDatabase = try {
        SQLiteDatabase.openOrCreateDatabase(filePath, null)
    } catch (e: RuntimeException) {
        throw RNMBTileSourceException.CouldNotReadFileException()
    }

    // Initialises a source object with the given path and identifier.
    // We make various requests against the database, and pull out relevant metadata.
    // This metadata can then be used within the JS layer to correctly render tiles.
    init {
        try {
            val minZoomLevel = getMetadata("minzoom")?.toInt() ?: 0
            val maxZoomLevel = getMetadata("maxzoom")?.toInt() ?: 0
            format = getMetadata("format")
            val tms = true
            isVector = when (format) {
                in VALID_VECTOR_FORMATS -> true
                in VALID_RASTER_FORMATS -> false
                else -> throw RNMBTileSourceException.UnsupportedFormatException()
            }
            val tileSize = 256
            val attribution = getMetadata("attribution")
            val layersJson = null// getMetadata("json")

            metadata = RNMBTileMetadata(
                minZoomLevel = minZoomLevel,
                maxZoomLevel = maxZoomLevel,
                isVector = isVector,
                tms = tms,
                tileSize = tileSize,
                attribution = attribution,
                layersJson = layersJson)
        } catch (error: RNMBTileSourceException) {
            print(error.localizedMessage)
            throw error
        }
    }

    fun getMappedMetadata(): WritableNativeMap? {
        return metadata?.mappedMetadata
    }

    // Given coordinates, queries the database and returns a tile if one exists.
    fun getTile(z: Int, x: Int, y: Int): ByteArray {
        val c = database.query(
            "tiles",
            arrayOf("tile_data"),
            "(zoom_level = ?) and (tile_column = ?) and (tile_row = ?)",
            arrayOf(z.toString(), x.toString(), y.toString()),
            null,
            null,
            null)
        c.moveToFirst()
        val index = c.getColumnIndex("tile_data")
        val data = c.getBlob(index)
        c.close()
        return data
    }

    // Given a metadata property, queries the database and returns it, if it exists.
    private fun getMetadata(property: String): String? {
        val c = database.query("metadata", arrayOf("name", "value"), "name = ?", arrayOf(property), null, null, null)
        c.moveToFirst()
        val index = c.getColumnIndex("value")
        val data = c.getString(index)
        c.close()
        return data
    }
}