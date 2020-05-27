package com.forestwatcher

import android.database.sqlite.SQLiteDatabase
import com.facebook.react.bridge.WritableNativeMap
import org.jetbrains.anko.db.MapRowParser
import org.jetbrains.anko.db.select

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
)
{

    val mappedMetadata: WritableNativeMap
        get() {
            var nativeMap: WritableNativeMap = WritableNativeMap()
            nativeMap.putInt("minZoomLevel", minZoomLevel)
            nativeMap.putInt("maxZoomLevel", maxZoomLevel)
            nativeMap.putBoolean("isVector", isVector)
            nativeMap.putBoolean("tms", tms)
            nativeMap.putInt("tileSize", tileSize);
            nativeMap.putString("attribution", attribution)
            nativeMap.putString("layersJson", layersJson)

            return nativeMap
        }
}

// Defines various errors that may occur whilst working against this source.
sealed class RNMBTileSourceError : Error() {
    class CouldNotReadFileError : RNMBTileSourceError()
    class TileNotFoundError : RNMBTileSourceError()
    class UnsupportedFormatError : RNMBTileSourceError()
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
        throw RNMBTileSourceError.CouldNotReadFileError()
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
                else -> throw RNMBTileSourceError.UnsupportedFormatError()
            }
            val tileSize = 256
            val attribution = getMetadata("attribution")
            val layersJson = null// getMetadata("json")

            metadata = RNMBTileMetadata(minZoomLevel = minZoomLevel, maxZoomLevel = maxZoomLevel, isVector = isVector, tms = tms, tileSize = tileSize, attribution = attribution, layersJson = layersJson)
        } catch (error: RNMBTileSourceError) {
            print(error.localizedMessage)
            throw error
        }
    }

    // Given coordinates, queries the database and returns a tile if one exists.
    fun getTile(z: Int, x: Int, y: Int): ByteArray {
        return database.select("tiles")
                .whereArgs("(zoom_level = {z}) and (tile_column = {x}) and (tile_row = {y})",
                        "z" to z, "x" to x, "y" to y)
                .parseList(TilesParser)
                .run { if (!isEmpty()) get(0) else null }
                ?: throw RNMBTileSourceError.TileNotFoundError()
    }

    // Given a metadata property, queries the database and returns it, if it exists.
    private fun getMetadata(property: String): String? {
        return database.select("metadata").whereSimple("name = ?", property).parseOpt(MetadataParser)?.second
    }
}

object MetadataParser : MapRowParser<Pair<String, String>> {
    override fun parseRow(columns: Map<String, Any?>): Pair<String, String> =
            columns["name"] as String to columns["value"] as String
}

object TilesParser : MapRowParser<ByteArray> {
    override fun parseRow(columns: Map<String, Any?>): ByteArray = columns["tile_data"] as ByteArray
}
